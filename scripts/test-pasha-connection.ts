/**
 * One-off mTLS connectivity check against PASHA CardSuite ECOMM.
 *
 * Calls the real registerTransaction() (command=v) from lib/payments/pasha.ts
 * — no getTransactionResult (command=c), no buildRedirectUrl, no card
 * involved. Per the integration doc, an unconfirmed registration auto-
 * reverses at the bank within 3 minutes.
 *
 * The hostname-verification workaround (bank's ECOMM server cert has no SAN
 * for ecomm.pashabank.az) now lives in lib/payments/pasha.ts itself, so this
 * script needs no TLS overrides of its own.
 *
 * Run with: npx tsx scripts/test-pasha-connection.ts
 */
import "dotenv/config";
import { registerTransaction } from "../lib/payments/pasha";

async function main() {
  console.log("PASHA ECOMM connectivity check (register-only, no card, no completion)");
  console.log({
    ecommUrl: process.env.PASHA_ECOMM_URL || "(default) https://ecomm.pashabank.az:18443/ecomm2/MerchantHandler",
    terminalId: process.env.PASHA_TERMINAL_ID,
    certPath: process.env.PASHA_CERT_PATH,
    keyPath: process.env.PASHA_KEY_PATH,
    caPath: process.env.PASHA_CA_PATH,
  });

  try {
    const result = await registerTransaction({
      amount: 1.0,
      currency: "AZN",
      clientIp: "127.0.0.1",
      description: "mTLS connectivity check — no completion will be requested",
    });

    console.log("\n--- Parsed result ---");
    console.log(result);
  } catch (err) {
    console.error("\n--- registerTransaction threw ---");
    console.error(err);
    process.exitCode = 1;
  }
}

main();
