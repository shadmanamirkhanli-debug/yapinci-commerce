"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

export default function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    setSuccessMessage(null);
    setDevResetUrl(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      setServerError(result.error ?? t("forgotPasswordError"));
      return;
    }

    setSuccessMessage(result.message);
    if (result.resetUrl) {
      setDevResetUrl(result.resetUrl);
    }
  };

  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-accent">
          Yapinci
        </p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground">
          {t("forgotPasswordTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t("forgotPasswordSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label={t("emailLabel")}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        {serverError && (
          <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error" role="alert">
            {serverError}
          </p>
        )}

        {successMessage && (
          <p className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success" role="status">
            {successMessage}
          </p>
        )}

        {devResetUrl && (
          <p className="rounded-xl bg-secondary px-4 py-3 text-xs text-muted break-all">
            {t("devLinkLabel")}{" "}
            <Link href={devResetUrl} className="text-accent hover:underline">
              {devResetUrl}
            </Link>
          </p>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          {t("sendLinkCta")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="text-foreground hover:text-accent">
          {t("backToLogin")}
        </Link>
      </p>
    </Card>
  );
}
