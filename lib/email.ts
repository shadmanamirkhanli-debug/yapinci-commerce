import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { decryptValue } from "@/lib/encryption";

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

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const settings = await getEmailSettings();

  if (!settings || !settings.smtpHost || !settings.smtpUser) {
    console.warn("[Email] SMTP not configured, skipping send to", params.to);
    return false;
  }

  try {
    const password = settings.smtpPassword
      ? decryptValue(settings.smtpPassword)
      : "";

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: password,
      },
    });

    await transporter.sendMail({
      from: settings.fromName + " <" + settings.fromEmail + ">",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    return true;
  } catch (error) {
    console.error("[Email] Send failed:", error);
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
