import "dotenv/config";
import { sendTelegramMessage } from "../lib/telegram";

async function main() {
  const sent = await sendTelegramMessage(
    "✅ Bu, Telegram sifariş bildirişlərinin düzgün işlədiyini yoxlamaq üçün test mesajıdır."
  );

  console.log(JSON.stringify({ sent }));

  if (!sent) {
    process.exitCode = 1;
  }
}

main();
