import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminAudited } from "@/lib/admin/require-admin";
import { apiError, apiSuccess } from "@/lib/api-response";
import { encryptValue, decryptValue, maskSecret } from "@/lib/encryption";
import { paymentSettingsSchema } from "@/lib/validations/payment-settings";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await prisma.paymentSettings.findUnique({
    where: { id: 1 },
  });

  if (!settings) {
    return apiSuccess({
      provider: "test",
      testMode: true,
      merchantId: "",
      apiKeyMasked: "",
      secretKeyMasked: "",
      webhookSecretMasked: "",
    });
  }

  return apiSuccess({
    provider: settings.provider,
    testMode: settings.testMode,
    merchantId: settings.merchantId ?? "",
    apiKeyMasked: maskSecret(settings.apiKey ? decryptValue(settings.apiKey) : null),
    secretKeyMasked: maskSecret(settings.secretKey ? decryptValue(settings.secretKey) : null),
    webhookSecretMasked: maskSecret(
      settings.webhookSecret ? decryptValue(settings.webhookSecret) : null
    ),
  });
}

export async function PUT(request: Request) {
  const { error } = await requireAdminAudited(request, {
    action: "payment_settings.update",
    entityType: "PaymentSettings",
    entityId: "1",
  });
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = paymentSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid data", 400);
    }

    const data = parsed.data;

    const existing = await prisma.paymentSettings.findUnique({ where: { id: 1 } });

    const apiKeyToStore = data.apiKey
      ? encryptValue(data.apiKey)
      : existing?.apiKey ?? null;
    const secretKeyToStore = data.secretKey
      ? encryptValue(data.secretKey)
      : existing?.secretKey ?? null;
    const webhookSecretToStore = data.webhookSecret
      ? encryptValue(data.webhookSecret)
      : existing?.webhookSecret ?? null;

    const updated = await prisma.paymentSettings.upsert({
      where: { id: 1 },
      update: {
        provider: data.provider,
        testMode: data.testMode,
        merchantId: data.merchantId || null,
        apiKey: apiKeyToStore,
        secretKey: secretKeyToStore,
        webhookSecret: webhookSecretToStore,
      },
      create: {
        id: 1,
        provider: data.provider,
        testMode: data.testMode,
        merchantId: data.merchantId || null,
        apiKey: apiKeyToStore,
        secretKey: secretKeyToStore,
        webhookSecret: webhookSecretToStore,
      },
    });

    return apiSuccess({
      provider: updated.provider,
      testMode: updated.testMode,
    });
  } catch {
    return apiError("Failed to update payment settings", 500);
  }
}
