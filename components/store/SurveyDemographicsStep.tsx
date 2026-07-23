"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type AgeBand = "UNDER_18" | "AGE_18_24" | "AGE_25_34" | "AGE_35_44" | "AGE_45_PLUS" | "UNSPECIFIED";
type Gender = "FEMALE" | "MALE" | "OTHER" | "UNSPECIFIED";

const AGE_BANDS: { value: AgeBand; labelKey: string }[] = [
  { value: "UNDER_18", labelKey: "ageBandUnder18" },
  { value: "AGE_18_24", labelKey: "ageBand1824" },
  { value: "AGE_25_34", labelKey: "ageBand2534" },
  { value: "AGE_35_44", labelKey: "ageBand3544" },
  { value: "AGE_45_PLUS", labelKey: "ageBand45Plus" },
  { value: "UNSPECIFIED", labelKey: "demographicsPreferNotToSay" },
];

const GENDERS: { value: Gender; labelKey: string }[] = [
  { value: "FEMALE", labelKey: "genderFemale" },
  { value: "MALE", labelKey: "genderMale" },
  { value: "OTHER", labelKey: "genderOther" },
  { value: "UNSPECIFIED", labelKey: "demographicsPreferNotToSay" },
];

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-full border px-4 text-sm font-medium tracking-wide transition-colors duration-300",
        active
          ? "border-accent bg-accent text-background"
          : "border-border text-primary hover:border-accent"
      )}
    >
      {children}
    </button>
  );
}

export default function SurveyDemographicsStep({ onDone }: { onDone: () => void }) {
  const t = useTranslations("Survey");
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    setSubmitting(true);
    await fetch("/api/survey/demographics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ageBand: ageBand ?? undefined,
        gender: gender ?? undefined,
      }),
    });
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-border bg-white p-6 shadow-sm lg:p-8">
      <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-primary">
        {t("demographicsTitle")}
      </h3>
      <p className="mt-2 text-sm text-muted">{t("demographicsDescription")}</p>

      <div className="mt-6">
        <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">{t("ageBandLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {AGE_BANDS.map((band) => (
            <ChoiceButton
              key={band.value}
              active={ageBand === band.value}
              onClick={() => setAgeBand(band.value)}
            >
              {t(band.labelKey)}
            </ChoiceButton>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted">{t("genderLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((option) => (
            <ChoiceButton
              key={option.value}
              active={gender === option.value}
              onClick={() => setGender(option.value)}
            >
              {t(option.labelKey)}
            </ChoiceButton>
          ))}
        </div>
      </div>

      <Button type="button" fullWidth loading={submitting} onClick={handleContinue} className="mt-8">
        {t("continueCta")}
      </Button>
    </div>
  );
}
