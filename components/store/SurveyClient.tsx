"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import SurveyDemographicsStep from "@/components/store/SurveyDemographicsStep";
import { cn } from "@/lib/utils/cn";

type SurveyDesign = {
  id: string;
  title: string;
  imageUrl: string;
  hasVoted: boolean;
};

type PriceBand = "UNDER_25" | "FROM_25_TO_40" | "FROM_40_TO_55" | "FROM_55_TO_70" | "OVER_70";

const PRICE_BANDS: { value: PriceBand; labelKey: string }[] = [
  { value: "UNDER_25", labelKey: "priceBandUnder25" },
  { value: "FROM_25_TO_40", labelKey: "priceBand2540" },
  { value: "FROM_40_TO_55", labelKey: "priceBand4055" },
  { value: "FROM_55_TO_70", labelKey: "priceBand5570" },
  { value: "OVER_70", labelKey: "priceBandOver70" },
];

export default function SurveyClient() {
  const t = useTranslations("Survey");
  const [designs, setDesigns] = useState<SurveyDesign[] | null>(null);
  const [hasAnsweredDemographics, setHasAnsweredDemographics] = useState(false);
  const [score, setScore] = useState(50);
  const [wouldBuy, setWouldBuy] = useState<boolean | null>(null);
  const [priceBand, setPriceBand] = useState<PriceBand | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/survey/designs");
      const result = await response.json();
      if (cancelled) return;
      if (result.success) {
        setDesigns(result.data.designs);
        setHasAnsweredDemographics(result.data.hasAnsweredDemographics);
      } else {
        setDesigns([]);
        setError(t("genericError"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const pending = useMemo(
    () => designs?.filter((design) => !design.hasVoted) ?? [],
    [designs]
  );
  const total = designs?.length ?? 0;
  const votedCount = total - pending.length;
  const current = pending[0];

  const resetForm = () => {
    setScore(50);
    setWouldBuy(null);
    setPriceBand(null);
    setSuggestion("");
  };

  const canSubmit = wouldBuy !== null && (!wouldBuy || !!priceBand);

  const handleSubmit = async () => {
    if (!current || !canSubmit) return;
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/survey/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        designId: current.id,
        score,
        wouldBuy,
        priceBand: wouldBuy ? priceBand ?? undefined : undefined,
        suggestion: suggestion.trim() || undefined,
      }),
    });

    if (response.ok || response.status === 409) {
      setDesigns(
        (previous) =>
          previous?.map((design) =>
            design.id === current.id ? { ...design, hasVoted: true } : design
          ) ?? previous
      );
      resetForm();
    } else if (response.status === 429) {
      setError(t("rateLimitError"));
    } else {
      setError(t("genericError"));
    }

    setSubmitting(false);
  };

  if (designs === null) {
    return <p className="text-center text-sm text-muted">{t("loading")}</p>;
  }

  if (total === 0) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-primary">{t("emptyStateTitle")}</p>
        <p className="mt-2 text-sm text-muted">{t("emptyStateDescription")}</p>
      </div>
    );
  }

  if (!hasAnsweredDemographics) {
    return <SurveyDemographicsStep onDone={() => setHasAnsweredDemographics(true)} />;
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.15em] text-accent">
          {t("thanksTitle")}
        </p>
        <p className="mt-3 text-sm text-muted">{t("thanksDescription")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="mb-4 text-center text-xs uppercase tracking-[0.2em] text-muted">
        {t("progressLabel", { current: votedCount + 1, total })}
      </p>

      <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <div className="aspect-[4/3] w-full bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.imageUrl}
            alt={current.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-6 p-6 lg:p-8">
          <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-primary">
            {current.title}
          </h3>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.15em] text-muted">
              <span>{t("scoreLabel")}</span>
              <span className="text-primary">{score}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={score}
              onChange={(event) => setScore(Number(event.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">
              {t("wouldBuyLabel")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWouldBuy(true)}
                className={cn(
                  "h-12 rounded-full border text-sm font-medium tracking-wide transition-colors duration-300",
                  wouldBuy === true
                    ? "border-accent bg-accent text-background"
                    : "border-border text-primary hover:border-accent"
                )}
              >
                {t("wouldBuyYes")}
              </button>
              <button
                type="button"
                onClick={() => setWouldBuy(false)}
                className={cn(
                  "h-12 rounded-full border text-sm font-medium tracking-wide transition-colors duration-300",
                  wouldBuy === false
                    ? "border-accent bg-accent text-background"
                    : "border-border text-primary hover:border-accent"
                )}
              >
                {t("wouldBuyNo")}
              </button>
            </div>
          </div>

          {wouldBuy === true && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">
                {t("priceBandQuestion")}
              </p>
              <div className="flex flex-wrap gap-2">
                {PRICE_BANDS.map((band) => (
                  <button
                    key={band.value}
                    type="button"
                    onClick={() => setPriceBand(band.value)}
                    className={cn(
                      "h-11 rounded-full border px-4 text-sm font-medium tracking-wide transition-colors duration-300",
                      priceBand === band.value
                        ? "border-accent bg-accent text-background"
                        : "border-border text-primary hover:border-accent"
                    )}
                  >
                    {t(band.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Textarea
            label={t("suggestionLabel")}
            placeholder={t("suggestionPlaceholder")}
            rows={3}
            value={suggestion}
            onChange={(event) => setSuggestion(event.target.value)}
          />

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button
            type="button"
            fullWidth
            loading={submitting}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {t("submitCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
