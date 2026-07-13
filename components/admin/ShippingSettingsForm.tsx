"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { adminCardClass, adminFieldClass } from "@/lib/admin/styles";

export default function ShippingSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [standardPrice, setStandardPrice] = useState("10");
  const [standardDays, setStandardDays] = useState("3-5 iş günü");
  const [expressPrice, setExpressPrice] = useState("25");
  const [expressDays, setExpressDays] = useState("1-2 iş günü");
  const [internationalPrice, setInternationalPrice] = useState("50");
  const [internationalDays, setInternationalDays] = useState("7-14 iş günü");
  const [internationalActive, setInternationalActive] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("");

  useEffect(() => {
    fetch("/api/admin/shipping-settings")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          const d = result.data;
          setStandardPrice(String(d.standardPrice));
          setStandardDays(d.standardDays);
          setExpressPrice(String(d.expressPrice));
          setExpressDays(d.expressDays);
          setInternationalPrice(String(d.internationalPrice));
          setInternationalDays(d.internationalDays);
          setInternationalActive(d.internationalActive);
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
        standardDays,
        expressPrice: Number(expressPrice),
        expressDays,
        internationalPrice: Number(internationalPrice),
        internationalDays,
        internationalActive,
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
      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Azərbaycan Üzrə Tariflər
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Standard Qiymət (AZN)"
            type="number"
            step="0.01"
            value={standardPrice}
            onChange={(event) => setStandardPrice(event.target.value)}
            className={adminFieldClass}
          />
          <Input
            label="Standard Müddət"
            value={standardDays}
            onChange={(event) => setStandardDays(event.target.value)}
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
          <Input
            label="Sürətli Müddət"
            value={expressDays}
            onChange={(event) => setExpressDays(event.target.value)}
            className={adminFieldClass}
          />
        </div>
      </div>

      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Xarici Ölkələr
        </h2>
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={internationalActive}
              onChange={(event) => setInternationalActive(event.target.checked)}
            />
            Beynəlxalq çatdırılma aktivdir
          </label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Beynəlxalq Qiymət (AZN)"
              type="number"
              step="0.01"
              value={internationalPrice}
              onChange={(event) => setInternationalPrice(event.target.value)}
              className={adminFieldClass}
            />
            <Input
              label="Beynəlxalq Müddət"
              value={internationalDays}
              onChange={(event) => setInternationalDays(event.target.value)}
              className={adminFieldClass}
            />
          </div>
        </div>
      </div>

      <div className={`${adminCardClass} p-6`}>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">
          Pulsuz Çatdırılma
        </h2>
        <Input
          label="Limit (AZN) — bu məbləğdən yuxarı sifarişlərdə çatdırılma pulsuzdur"
          type="number"
          step="0.01"
          value={freeShippingThreshold}
          onChange={(event) => setFreeShippingThreshold(event.target.value)}
          placeholder="Boş buraxsanız, pulsuz çatdırılma limiti olmaz"
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
