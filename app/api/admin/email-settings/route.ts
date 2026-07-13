import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminAudited } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { encryptValue, maskSecret } from "@/lib/encryption";
import { emailSettingsSchema } from "@/lib/validations/email-settings";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await prisma.emailSettings.findUnique({
    where: { id: 1 },
  });

  if (!settings) {
    return apiSuccess({
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPasswordMasked: "",
      fromEmail: "no-reply@yapinci.az",
      fromName: "Yapinci",
      orderConfirmationOn: true,
      passwordResetOn: true,
      adminNotificationOn: true,
      adminNotificationEmail: "",
    });
  }

  return apiSuccess({
    smtpHost: settings.smtpHost ?? "",
    smtpPort: settings.smtpPort,
    smtpUser: settings.smtpUser ?? "",
    smtpPasswordMasked: maskSecret(settings.smtpPassword ? "****" : null),
    fromEmail: settings.fromEmail,
    fromName: settings.fromName,
    orderConfirmationOn: settings.orderConfirmationOn,
    passwordResetOn: settings.passwordResetOn,
    adminNotificationOn: settings.adminNotificationOn,
    adminNotificationEmail: settings.adminNotificationEmail ?? "",
  });
}

export async function PUT(request: Request) {
  const { error } = await requireAdminAudited(request, {
    action: "email_settings.update",
    entityType: "EmailSettings",
    entityId: "1",
  });
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = emailSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const data = parsed.data;
    const existing = await prisma.emailSettings.findUnique({ where: { id: 1 } });

    const passwordToStore = data.smtpPassword
      ? encryptValue(data.smtpPassword)
      : existing?.smtpPassword ?? null;

    const updated = await prisma.emailSettings.upsert({
      where: { id: 1 },
      update: {
        smtpHost: data.smtpHost || null,
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser || null,
        smtpPassword: passwordToStore,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        orderConfirmationOn: data.orderConfirmationOn,
        passwordResetOn: data.passwordResetOn,
        adminNotificationOn: data.adminNotificationOn,
        adminNotificationEmail: data.adminNotificationEmail || null,
      },
      create: {
        id: 1,
        smtpHost: data.smtpHost || null,
        smtpPort: data.smtpPort,
        smtpUser: data.smtpUser || null,
        smtpPassword: passwordToStore,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        orderConfirmationOn: data.orderConfirmationOn,
        passwordResetOn: data.passwordResetOn,
        adminNotificationOn: data.adminNotificationOn,
        adminNotificationEmail: data.adminNotificationEmail || null,
      },
    });

    return apiSuccess(updated);
  } catch {
    return apiError("Failed to update email settings", 500);
  }
}
