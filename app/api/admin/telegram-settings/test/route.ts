import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  const sent = await sendTelegramMessage(
    "✅ Bu, Telegram sifariş bildirişlərinin düzgün işlədiyini yoxlamaq üçün test mesajıdır."
  );

  if (!sent) {
    return apiError(
      "Mesaj göndərilmədi. TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID tənzimləmələrini yoxlayın.",
      500
    );
  }

  return apiSuccess({ sent: true });
}
