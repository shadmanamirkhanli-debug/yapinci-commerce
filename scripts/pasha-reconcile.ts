/**
 * Cron entrypoint for the PASHA reconciliation sweep — see
 * lib/payments/pasha-reconciliation.ts for what/why. No-ops (checked: 0)
 * when PASHA_ENABLED is not "true".
 *
 * Intended to run every ~5 minutes via system cron. Run manually with:
 *   npx tsx scripts/pasha-reconcile.ts
 */
import "dotenv/config";
import { reconcilePendingPashaPayments } from "../lib/payments/pasha-reconciliation";

async function main() {
  const result = await reconcilePendingPashaPayments();
  console.log(JSON.stringify({ ...result, at: new Date().toISOString() }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
