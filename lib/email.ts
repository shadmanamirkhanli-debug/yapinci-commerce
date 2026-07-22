import { Resend } from "resend";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const FROM = "Yapinci <info@yapinci.az>";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

async function getEmailSettings() {
  const settings = await prisma.emailSettings.findUnique({
    where: { id: 1 },
  });
  return settings;
}

let client: Resend | null | undefined;

// Lazy + memoized: reads RESEND_API_KEY once rather than on every send, but
// still re-checked (via `undefined` vs `null`) instead of evaluated at
// import time, since that would crash module load in envs where the key
// isn't set (build, tests).
function getResendClient(): Resend | null {
  if (client === undefined) {
    const apiKey = process.env.RESEND_API_KEY;
    client = apiKey ? new Resend(apiKey) : null;
  }
  return client;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const resend = getResendClient();

  if (!resend) {
    logger.warn("[Email] RESEND_API_KEY not set, skipping send", { to: params.to });
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      logger.error("[Email] Resend send failed", { to: params.to, error: error.message });
      return false;
    }

    return true;
  } catch (error) {
    logger.error("[Email] Send threw unexpectedly", {
      to: params.to,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function isNotificationEnabled(
  type: "orderConfirmationOn" | "passwordResetOn" | "adminNotificationOn"
): Promise<boolean> {
  const settings = await getEmailSettings();
  if (!settings) return false;
  return settings[type];
}

export async function getAdminNotificationEmail(): Promise<string | null> {
  const settings = await getEmailSettings();
  return settings?.adminNotificationEmail ?? null;
}
