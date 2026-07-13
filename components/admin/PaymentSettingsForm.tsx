"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { adminCardClass, adminFieldClass } from "@/lib/admin/styles";

type PaymentSettingsData = {
  provider: string;
  testMode: boolean;
  merchantId: string;
  apiKeyMasked: string;
  secretKeyMasked: string;
  webhookSecretMasked: string;
};

export default function PaymentSettingsForm() {
  const [data, setData] = useState<PaymentSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [provider, setProvider] = useState("test");
  const [testMode, setTestMode] = useState(true);
  const [merchantId, setMerchantId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");

  useEffect(() => {
    fetch("/api/admin/payment-settings")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          const d: PaymentSettingsData = result.data;
          setData(d);
          setProvider(d.provider);
          setTestMode(d.testMode);
          setMerchantId(d.merchantId);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/admin/payment-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        testMode,
        merchantId,
        apiKey: apiKey || undefined,
        secretKey: secretKey || undefined,
        webhookSecret: webhookSecret || undefined,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "Xəta baş verdi");
      setSaving(false);
      return;
    }

    setMessage("Ödəniş tənzimləmələri yadda saxlanıldı");
    setApiKey("");
    setSecretKey("");
    setWebhookSecret("");
    setSaving(false);
  };

  if (loading) {
    return <p className="text-sm text-neutral-500">Yüklənir...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Ödəniş Provayderi
        </h2>
        <div className="space-y-4">
          <Select
            label="Provayder"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            options={[
              { value: "test", label: "Test Rejimi (real ödəniş yoxdur)" },
              { value: "abb", label: "ABB Bank" },
              { value: "pashabank", label: "PaşaBank" },
            ]}
            className={adminFieldClass}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={testMode}
              onChange={(event) => setTestMode(event.target.checked)}
            />
            Test rejimi aktivdir (real pul köçürülmür)
          </label>

          <Input
            label="Merchant ID"
            value={merchantId}
            onChange={(event) => setMerchantId(event.target.value)}
            className={adminFieldClass}
          />

          <Input
            label={`API Açarı ${data?.apiKeyMasked ? `(hazırda: ${data.apiKeyMasked})` : ""}`}
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Yeni açar daxil edin (dəyişmək istəmirsinizsə boş buraxın)"
            className={adminFieldClass}
          />

          <Input
            label={`Gizli Açar ${data?.secretKeyMasked ? `(hazırda: ${data.secretKeyMasked})` : ""}`}
            value={secretKey}
            onChange={(event) => setSecretKey(event.target.value)}
            placeholder="Yeni açar daxil edin (dəyişmək istəmirsinizsə boş buraxın)"
            className={adminFieldClass}
            type="password"
          />

          <Input
            label={`Webhook Gizli Açarı ${data?.webhookSecretMasked ? `(hazırda: ${data.webhookSecretMasked})` : ""}`}
            value={webhookSecret}
            onChange={(event) => setWebhookSecret(event.target.value)}
            placeholder="Yeni açar daxil edin (dəyişmək istəmirsinizsə boş buraxın)"
            className={adminFieldClass}
            type="password"
          />
        </div>
      </div>

      <div className={`${adminCardClass} p-6`}>
        <p className="text-sm text-neutral-400">
          ABB Bank və ya PaşaBank ilə real kart ödənişi qəbul etmək üçün, bankın
          tacir xidmətləri (merchant services) şöbəsi ilə əlaqə saxlayıb rəsmi
          API sənədləşməsini əldə etməlisiniz. Əldə etdikdən sonra yuxarıdakı
          sahələri doldurun.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={saving}>
          Yadda Saxla
        </Button>
        {message && <p className="text-sm text-green-400">{message}</p>}
      </div>
    </form>
  );
}
