"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { adminCardClass, adminFieldClass } from "@/lib/admin/styles";

export default function ShippingSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [standardPrice, setStandardPrice] = useState("0");
  const [expressPrice, setExpressPrice] = useState("5");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");

  useEffect(() => {
    fetch("/api/admin/shipping-settings")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          const d = result.data;
          setStandardPrice(String(d.standardPrice));
          setExpressPrice(String(d.expressPrice));
          setFreeShippingThreshold(
            d.freeShippingThreshold !== null ? String(d.freeShippingThreshold) : ""
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/admin/shipping-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        standardPrice: Number(standardPrice),
        expressPrice: Number(expressPrice),
        freeShippingThreshold:
          freeShippingThreshold === "" ? null : Number(freeShippingThreshold),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "Xəta baş verdi");
      setSaving(false);
      return;
    }

    setMessage("Çatdırılma tənzimləmələri yadda saxlanıldı");
    setSaving(false);
  };

  if (loading) {
    return <p className="text-sm text-neutral-500">Yüklənir...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <p className="text-sm text-neutral-500">
        Çatdırılma hazırda yalnız Bakı şəhəri daxilində fəaliyyət göstərir. Metod adları
        və müddət mətnləri (məs. &quot;2-3 iş günü&quot;, &quot;saat 14:00-a qədər sifariş&quot;)
        tərcümə fayllarında (ShippingMethods) idarə olunur — burada yalnız qiymət və
        pulsuz çatdırılma limitini dəyişə bilərsiniz.
      </p>

      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Bakı Üzrə Tariflər
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Standart Qiymət (AZN)"
            type="number"
            step="0.01"
            value={standardPrice}
            onChange={(event) => setStandardPrice(event.target.value)}
            className={adminFieldClass}
          />
          <Input
            label="Sürətli Qiymət (AZN)"
            type="number"
            step="0.01"
            value={expressPrice}
            onChange={(event) => setExpressPrice(event.target.value)}
            className={adminFieldClass}
          />
        </div>
      </div>

      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Pulsuz Çatdırılma
        </h2>
        <Input
          label="Limit (AZN) — bu məbləğdən yuxarı sifarişlərdə sürətli çatdırılma da pulsuz olsun"
          type="number"
          step="0.01"
          value={freeShippingThreshold}
          onChange={(event) => setFreeShippingThreshold(event.target.value)}
          placeholder="Boş buraxsanız, əlavə limit tətbiq olunmaz (standart çatdırılma onsuz da pulsuzdur)"
          className={adminFieldClass}
        />
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
