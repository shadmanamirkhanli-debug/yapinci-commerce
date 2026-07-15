/**
 * PASHA Bank CardSuite ECOMM client — SKELETON, not wired into checkout yet.
 *
 * Gated by PASHA_ENABLED (see isPashaEnabled()). We don't have the bank-signed
 * client certificate or a real PASHA_TERMINAL_ID yet, so nothing here has been
 * exercised against the bank. Cert/key/CA paths and terminal id are read from
 * env only — never hardcode them, never read from certs/ directly except via
 * these env-configured paths.
 *
 * Flow this module implements (per the CardSuite ECOMM integration doc):
 *  - registerTransaction(): command=v — registers a transaction, returns TRANSACTION_ID.
 *  - getTransactionResult(): command=c — after the customer completes 3D-Secure
 *    and is redirected back to us, we ask the bank server-to-server for the
 *    authoritative result. The doc states the bank auto-reverses the
 *    transaction if command=c isn't requested within 3 minutes of registration.
 *
 * Several exact wire-format details aren't in the doc excerpt we have and are
 * marked TODO below rather than guessed, per instructions.
 */

import https from "node:https";
import fs from "node:fs";

export function isPashaEnabled(): boolean {
  return process.env.PASHA_ENABLED === "true";
}

type PashaConfig = {
  ecommUrl: string;
  merchantId: string;
  terminalId: string;
  certPath: string;
  keyPath: string;
  caPath: string;
};

function getConfig(): PashaConfig {
  const ecommUrl = process.env.PASHA_ECOMM_URL;
  const certPath = process.env.PASHA_CERT_PATH;
  const keyPath = process.env.PASHA_KEY_PATH;
  const caPath = process.env.PASHA_CA_PATH;
  // Doc gives 6000225 as the merchant id; kept as a fallback default, not hardcoded elsewhere.
  const merchantId = process.env.PASHA_MERCHANT_ID ?? "6000225";
  // Intentionally allowed blank until the bank issues a real terminal id.
  const terminalId = process.env.PASHA_TERMINAL_ID ?? "";

  if (!ecommUrl || !certPath || !keyPath || !caPath) {
    throw new Error(
      "PASHA Bank is not configured: PASHA_ECOMM_URL, PASHA_CERT_PATH, PASHA_KEY_PATH and PASHA_CA_PATH must all be set"
    );
  }

  return { ecommUrl, merchantId, terminalId, certPath, keyPath, caPath };
}

let cachedAgent: https.Agent | null = null;
let cachedAgentKey: string | null = null;

function getAgent(config: PashaConfig): https.Agent {
  const key = `${config.certPath}:${config.keyPath}:${config.caPath}`;
  if (cachedAgent && cachedAgentKey === key) {
    return cachedAgent;
  }

  // Mutual TLS: client cert/key = the bank-signed certificate (not present yet),
  // ca = the bank's CA so we verify the ECOMM endpoint too. Read lazily (not at
  // module load) so the app doesn't crash before the cert files exist.
  cachedAgent = new https.Agent({
    cert: fs.readFileSync(config.certPath),
    key: fs.readFileSync(config.keyPath),
    ca: fs.readFileSync(config.caPath),
  });
  cachedAgentKey = key;
  return cachedAgent;
}

function postForm(
  config: PashaConfig,
  body: string
): Promise<{ status: number; body: string }> {
  const target = new URL(config.ecommUrl);
  const agent = getAgent(config);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: target.hostname,
        port: target.port || 443,
        path: target.pathname + target.search,
        method: "POST",
        agent,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body: data }));
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// TODO(PASHA CardSuite ECOMM doc, command=v/command=c response chapter):
// we don't have the exact response encoding (JSON body? newline-delimited
// KEY=VALUE? something else?). This assumes "&"/newline-delimited KEY=VALUE
// pairs, which is common for this class of gateway, but it must be confirmed
// against the doc before this is ever pointed at the real endpoint.
function parseEcommResponse(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pairs = raw
    .split(/[\n&]/)
    .map((pair) => pair.trim())
    .filter(Boolean);

  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    result[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  }

  return result;
}

export type RegisterTransactionParams = {
  /** Major currency units (e.g. 12.34 for 12.34 AZN). TODO(doc): confirm the bank expects major, not minor, units. */
  amount: number;
  /** TODO(doc): confirm alpha ("AZN") vs ISO-4217 numeric ("944") is expected here. */
  currency: string;
  clientIp: string;
  description: string;
  /** TODO(doc): confirm expected language code format (e.g. "az" vs "AZ" vs "aze"). Defaults to "az". */
  language?: string;
};

export type RegisterTransactionResult = {
  transactionId: string;
  raw: Record<string, string>;
};

export async function registerTransaction(
  params: RegisterTransactionParams
): Promise<RegisterTransactionResult> {
  const config = getConfig();

  const fields: Record<string, string> = {
    command: "v",
    amount: String(params.amount),
    currency: params.currency,
    client_ip_addr: params.clientIp,
    msg_type: "SMS",
    terminal_id: config.terminalId,
    language: params.language ?? "az",
    description: params.description,
    // NOTE: merchant_id (PASHA_MERCHANT_ID) is intentionally NOT sent here —
    // the command=v field list in the doc excerpt we have does not include it.
    // TODO(doc): confirm whether merchant_id belongs in this request at all.
  };

  const body = new URLSearchParams(fields).toString();
  const { status, body: responseBody } = await postForm(config, body);

  if (status < 200 || status >= 300) {
    throw new Error(`PASHA ECOMM register request failed with HTTP ${status}`);
  }

  const raw = parseEcommResponse(responseBody);
  const transactionId = raw.TRANSACTION_ID;

  if (!transactionId) {
    throw new Error("PASHA ECOMM register response did not include TRANSACTION_ID");
  }

  return { transactionId, raw };
}

export type TransactionCompletionResult = {
  /** Doc confirms "OK" and "FAILED"; TODO(doc): confirm the full enumeration (reversal/timeout/etc). */
  result: string;
  raw: Record<string, string>;
};

export async function getTransactionResult(
  transId: string
): Promise<TransactionCompletionResult> {
  const config = getConfig();

  const fields: Record<string, string> = {
    command: "c",
    terminal_id: config.terminalId,
    trans_id: transId,
  };

  const body = new URLSearchParams(fields).toString();
  const { status, body: responseBody } = await postForm(config, body);

  if (status < 200 || status >= 300) {
    throw new Error(`PASHA ECOMM completion request failed with HTTP ${status}`);
  }

  const raw = parseEcommResponse(responseBody);
  const result = raw.RESULT;

  if (!result) {
    throw new Error("PASHA ECOMM completion response did not include RESULT");
  }

  return { result, raw };
}

// TODO(PASHA CardSuite ECOMM doc, card-entry redirect chapter): the doc
// excerpt we have doesn't specify the exact hosted card-entry page URL/path
// or its query param name for TRANSACTION_ID — this may not even live at
// PASHA_ECOMM_URL (registration and the customer-facing redirect are
// typically different endpoints on these gateways). Confirm before use.
export function buildRedirectUrl(transactionId: string): string {
  const config = getConfig();
  const url = new URL(config.ecommUrl);
  url.searchParams.set("trans_id", transactionId);
  return url.toString();
}
