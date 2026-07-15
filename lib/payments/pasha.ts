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
 *  - registerTransaction(): command=v against MerchantHandler (server-to-server,
 *    mTLS) — registers a transaction, returns TRANSACTION_ID.
 *  - buildRedirectUrl(): sends the browser to ClientHandler (plain redirect,
 *    no mTLS) to complete 3D-Secure.
 *  - getTransactionResult(): command=c against MerchantHandler — after the
 *    customer completes 3D-Secure and is redirected back to us, we ask the
 *    bank server-to-server for the authoritative result. The doc states the
 *    bank auto-reverses the transaction if command=c isn't requested within
 *    3 minutes of registration.
 *
 * Responses are newline-separated "KEY: VALUE" lines (see parseEcommResponse).
 * The RESULT_CODE enumeration (doc chapter 8) isn't mapped yet — see the TODO
 * on TransactionCompletionResult.resultCode — but the OK/FAILED decision does
 * not depend on it.
 */

import https from "node:https";
import fs from "node:fs";
import { logger } from "@/lib/logger";

export function isPashaEnabled(): boolean {
  return process.env.PASHA_ENABLED === "true";
}

// Confirmed with the bank's integration doc.
const DEFAULT_ECOMM_URL = "https://ecomm.pashabank.az:18443/ecomm2/MerchantHandler";
const DEFAULT_CLIENT_URL = "https://ecomm.pashabank.az:8463/ecomm2/ClientHandler";

// ISO-4217 numeric currency codes — CardSuite ECOMM expects the numeric code,
// not the alpha one. Extend as more currencies are confirmed.
const CURRENCY_NUMERIC_CODES: Record<string, string> = {
  AZN: "944",
};

function toIsoNumericCurrency(currency: string): string {
  const code = CURRENCY_NUMERIC_CODES[currency.toUpperCase()];
  if (!code) {
    throw new Error(
      `PASHA ECOMM: unsupported currency "${currency}" (no ISO-4217 numeric code configured)`
    );
  }
  return code;
}

/**
 * Converts a major-unit decimal amount (e.g. 25.50 AZN) to the integer minor
 * units (qəpik, exponent 2) CardSuite ECOMM expects (e.g. 2550). Rounds to
 * the nearest integer rather than truncating, to absorb float error from
 * amount * 100 (e.g. 19.99 * 100 === 1998.9999999999998).
 */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

type PashaConfig = {
  ecommUrl: string;
  clientUrl: string;
  merchantId: string;
  terminalId: string;
};

type PashaTlsConfig = {
  certPath: string;
  keyPath: string;
  caPath: string;
};

function getConfig(): PashaConfig {
  // Still overridable by env, but defaults to the confirmed bank endpoints now.
  const ecommUrl = process.env.PASHA_ECOMM_URL || DEFAULT_ECOMM_URL;
  const clientUrl = process.env.PASHA_CLIENT_URL || DEFAULT_CLIENT_URL;
  // Doc gives 6000225 as the merchant id; kept as a fallback default, not hardcoded elsewhere.
  const merchantId = process.env.PASHA_MERCHANT_ID ?? "6000225";
  // Intentionally allowed blank until the bank issues a real terminal id.
  const terminalId = process.env.PASHA_TERMINAL_ID ?? "";

  return { ecommUrl, clientUrl, merchantId, terminalId };
}

// Only needed for the server-to-server MerchantHandler calls, not for
// buildRedirectUrl (ClientHandler is a plain browser redirect, no mTLS).
function getTlsConfig(): PashaTlsConfig {
  const certPath = process.env.PASHA_CERT_PATH;
  const keyPath = process.env.PASHA_KEY_PATH;
  const caPath = process.env.PASHA_CA_PATH;

  if (!certPath || !keyPath || !caPath) {
    throw new Error(
      "PASHA Bank is not configured: PASHA_CERT_PATH, PASHA_KEY_PATH and PASHA_CA_PATH must all be set"
    );
  }

  return { certPath, keyPath, caPath };
}

let cachedAgent: https.Agent | null = null;
let cachedAgentKey: string | null = null;

function getAgent(tls: PashaTlsConfig): https.Agent {
  const key = `${tls.certPath}:${tls.keyPath}:${tls.caPath}`;
  if (cachedAgent && cachedAgentKey === key) {
    return cachedAgent;
  }

  // Mutual TLS: client cert/key = the bank-signed certificate (not present yet),
  // ca = the bank's CA so we verify the MerchantHandler endpoint too. Read
  // lazily (not at module load) so the app doesn't crash before the cert
  // files exist. Bank requires TLS 1.2 — set explicitly rather than trusting
  // Node's default negotiation.
  cachedAgent = new https.Agent({
    cert: fs.readFileSync(tls.certPath),
    key: fs.readFileSync(tls.keyPath),
    ca: fs.readFileSync(tls.caPath),
    minVersion: "TLSv1.2",
  });
  cachedAgentKey = key;
  return cachedAgent;
}

function postForm(
  config: PashaConfig,
  body: string
): Promise<{ status: number; body: string }> {
  const target = new URL(config.ecommUrl);
  const agent = getAgent(getTlsConfig());

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

// Confirmed with the bank's integration doc: command=v/command=c responses
// are newline-separated "KEY: VALUE" lines (colon-space separated) — not the
// "&"/"=" pairs this used to guess.
export function parseEcommResponse(raw: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const idx = trimmed.indexOf(":");
    if (idx === -1) {
      logger.warn("PASHA ECOMM response: unparseable line", { line: trimmed });
      continue;
    }

    result[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }

  return result;
}

function logUnexpectedFields(
  raw: Record<string, string>,
  known: ReadonlySet<string>,
  context: string
): void {
  for (const key of Object.keys(raw)) {
    if (!known.has(key)) {
      logger.warn(`PASHA ECOMM ${context} response included unexpected field`, {
        key,
        value: raw[key],
      });
    }
  }
}

const REGISTER_RESPONSE_FIELDS = new Set(["TRANSACTION_ID", "error"]);
const RESULT_RESPONSE_FIELDS = new Set([
  "RESULT",
  "RESULT_CODE",
  "RRN",
  "APPROVAL_CODE",
  "error",
]);

export type RegisterTransactionParams = {
  /** Major currency units (e.g. 12.34 for 12.34 AZN) — converted to minor units (qəpik) before sending. */
  amount: number;
  /** Alpha currency code (e.g. "AZN") — converted to its ISO-4217 numeric code before sending. */
  currency: string;
  clientIp: string;
  description?: string;
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
    amount: String(toMinorUnits(params.amount)),
    currency: toIsoNumericCurrency(params.currency),
    client_ip_addr: params.clientIp,
    msg_type: "SMS",
    terminal_id: config.terminalId,
    language: params.language ?? "az",
    // NOTE: merchant_id (PASHA_MERCHANT_ID) is intentionally NOT sent here —
    // the command=v field list in the doc excerpt we have does not include it.
    // TODO(doc): confirm whether merchant_id belongs in this request at all.
  };

  if (params.description) {
    fields.description = params.description;
  }

  const body = new URLSearchParams(fields).toString();
  const { status, body: responseBody } = await postForm(config, body);

  if (status < 200 || status >= 300) {
    throw new Error(`PASHA ECOMM register request failed with HTTP ${status}`);
  }

  const raw = parseEcommResponse(responseBody);
  logUnexpectedFields(raw, REGISTER_RESPONSE_FIELDS, "register");

  if (raw.error) {
    throw new Error(`PASHA ECOMM register request failed: ${raw.error}`);
  }

  const transactionId = raw.TRANSACTION_ID;

  if (!transactionId) {
    throw new Error("PASHA ECOMM register response did not include TRANSACTION_ID");
  }

  return { transactionId, raw };
}

export type TransactionCompletionResult = {
  /**
   * True only when RESULT === "OK" and no error field is present. This is
   * the sole payment-success signal — never inferred from the presence of
   * RRN/APPROVAL_CODE, and never defaults to true when RESULT is missing or
   * unrecognized.
   */
  paid: boolean;
  /** "OK" | "FAILED" per the doc; null if the field was absent. */
  result: string | null;
  /** CardSuite response code, for logging/support — TODO(doc chapter 8): map the full enumeration. */
  resultCode: string | null;
  /** 12-char reference, present only on success. */
  rrn: string | null;
  /** 6-char approval code, present only on success. */
  approvalCode: string | null;
  /** Present on request errors, e.g. "no transaction id" / "wrong transaction id". */
  error: string | null;
  raw: Record<string, string>;
};

/**
 * Pure OK/FAILED decision over already-parsed response fields — split out
 * from getTransactionResult so it's testable without mocking the mTLS HTTP
 * call. `paid` is the only field callers should branch on: RESULT === "OK"
 * and no error field, nothing else. Missing/unrecognized RESULT or a
 * present error field always resolve to NOT paid, never to a default of
 * success.
 */
export function deriveTransactionCompletion(
  raw: Record<string, string>
): TransactionCompletionResult {
  const result = raw.RESULT ?? null;
  const error = raw.error ?? null;

  return {
    paid: result === "OK" && !error,
    result,
    resultCode: raw.RESULT_CODE ?? null,
    rrn: raw.RRN ?? null,
    approvalCode: raw.APPROVAL_CODE ?? null,
    error,
    raw,
  };
}

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
  logUnexpectedFields(raw, RESULT_RESPONSE_FIELDS, "completion");

  const completion = deriveTransactionCompletion(raw);

  // RESULT_CODE enumeration (doc chapter 8) isn't mapped yet; log the raw
  // code so we can build that mapping later without re-running transactions.
  if (completion.resultCode) {
    logger.info("PASHA ECOMM completion RESULT_CODE", { transId, resultCode: completion.resultCode });
  }

  return completion;
}

// Confirmed with the bank: browser redirects go to ClientHandler (not
// MerchantHandler), with the registered transaction id as trans_id.
export function buildRedirectUrl(transactionId: string): string {
  const config = getConfig();
  const url = new URL(config.clientUrl);
  url.searchParams.set("trans_id", transactionId);
  return url.toString();
}
