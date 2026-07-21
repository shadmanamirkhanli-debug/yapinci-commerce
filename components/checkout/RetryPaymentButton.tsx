"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

type RetryPaymentButtonProps = {
  orderId: string;
  guestToken?: string | null;
};

export default function RetryPaymentButton({ orderId, guestToken }: RetryPaymentButtonProps) {
  const t = useTranslations("CheckoutConfirmation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retry = async () => {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/payments/pasha/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, guestToken: guestToken ?? undefined }),
    });
    const result = await response.json();

    if (!result.success) {
      setLoading(false);
      setError(result.error ?? t("retryError"));
      return;
    }

    window.location.href = result.data.redirectUrl;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button type="button" loading={loading} onClick={retry}>
        {t("retryCta")}
      </Button>
      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
