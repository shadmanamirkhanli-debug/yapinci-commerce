"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { adminCardClass, adminFieldClass } from "@/lib/admin/styles";

export default function EmailSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [orderConfirmationOn, setOrderConfirmationOn] = useState(true);
  const [passwordResetOn, setPasswordResetOn] = useState(true);
  const [adminNotificationOn, setAdminNotificationOn] = useState(true);
  const [adminNotificationEmail, setAdminNotificationEmail] = useState("");
  const [passwordMasked, setPasswordMasked] = useState("");

  useEffect(() => {
    fetch("/api/admin/email-settings")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          const d = result.data;
          setSmtpHost(d.smtpHost);
          setSmtpPort(String(d.smtpPort));
          setSmtpUser(d.smtpUser);
          setFromEmail(d.fromEmail);
          setFromName(d.fromName);
          setOrderConfirmationOn(d.orderConfirmationOn);
          setPasswordResetOn(d.passwordResetOn);
          setAdminNotificationOn(d.adminNotificationOn);
          setAdminNotificationEmail(d.adminNotificationEmail);
          setPasswordMasked(d.smtpPasswordMasked);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/admin/email-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        smtpHost,
        smtpPort: Number(smtpPort),
        smtpUser,
        smtpPassword: smtpPassword || undefined,
        fromEmail,
        fromName,
        orderConfirmationOn,
        passwordResetOn,
        adminNotificationOn,
        adminNotificationEmail,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "Xəta baş verdi");
      setSaving(false);
      return;
    }

    setMessage("Email tənzimləmələri yadda saxlanıldı");
    setSmtpPassword("");
    setSaving(false);
  };

  const sendTestEmail = async () => {
    setTesting(true);
    setTestMessage(null);

    const response = await fetch("/api/admin/email-settings/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const result = await response.json();

    if (!response.ok) {
      setTestMessage(result.error ?? "Test e-poçtu göndərilmədi");
    } else {
      setTestMessage("Test e-poçtu uğurla göndərildi");
    }

    setTesting(false);
  };

  if (loading) {
    return <p className="text-sm text-neutral-500">Yüklənir...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          SMTP Tənzimləmələri
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="SMTP Host"
            value={smtpHost}
            onChange={(event) => setSmtpHost(event.target.value)}
            placeholder="smtp.gmail.com"
            className={adminFieldClass}
          />
          <Input
            label="SMTP Port"
            type="number"
            value={smtpPort}
            onChange={(event) => setSmtpPort(event.target.value)}
            className={adminFieldClass}
          />
          <Input
            label="SMTP İstifadəçi Adı"
            value={smtpUser}
            onChange={(event) => setSmtpUser(event.target.value)}
            className={adminFieldClass}
          />
          <Input
            label={"SMTP Şifrə" + (passwordMasked ? " (təyin edilib)" : "")}
            type="password"
            value={smtpPassword}
            onChange={(event) => setSmtpPassword(event.target.value)}
            placeholder="Dəyişmək istəmirsinizsə boş buraxın"
            className={adminFieldClass}
          />
          <Input
            label="Göndərən Email"
            value={fromEmail}
            onChange={(event) => setFromEmail(event.target.value)}
            className={adminFieldClass}
          />
          <Input
            label="Göndərən Ad"
            value={fromName}
            onChange={(event) => setFromName(event.target.value)}
            className={adminFieldClass}
          />
        </div>
      </div>

      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Bildirişlər
        </h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={orderConfirmationOn}
              onChange={(event) => setOrderConfirmationOn(event.target.checked)}
            />
            Sifariş təsdiqi göndərilsin
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={passwordResetOn}
              onChange={(event) => setPasswordResetOn(event.target.checked)}
            />
            Şifrə bərpası göndərilsin
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={adminNotificationOn}
              onChange={(event) => setAdminNotificationOn(event.target.checked)}
            />
            Admin bildirişləri göndərilsin
          </label>
          <Input
            label="Admin Bildiriş Email-i"
            value={adminNotificationEmail}
            onChange={(event) => setAdminNotificationEmail(event.target.value)}
            placeholder="admin@yapinci.az"
            className={adminFieldClass}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={saving}>
          Yadda Saxla
        </Button>
        <Button type="button" variant="outline" loading={testing} onClick={sendTestEmail}>
          Test E-poçtu Göndər
        </Button>
      </div>

      {message && <p className="text-sm text-green-400">{message}</p>}
      {testMessage && <p className="text-sm text-blue-400">{testMessage}</p>}
    </form>
  );
}
