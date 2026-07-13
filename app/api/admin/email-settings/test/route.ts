import { requireAdmin } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const to = body.to || session?.user?.email;

  if (!to) {
    return apiError("Test üçün email ünvanı tapılmadı", 400);
  }

  const sent = await sendEmail({
    to,
    subject: "Test E-poçt — Yapinci",
    html: "<p>Bu, SMTP tənzimləmələrinizin düzgün işlədiyini yoxlamaq üçün test e-poçtudur.</p>",
  });

  if (!sent) {
    return apiError(
      "E-poçt göndərilmədi. SMTP tənzimləmələrini yoxlayın.",
      500
    );
  }

  return apiSuccess({ sent: true });
}
