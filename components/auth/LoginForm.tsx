"use client";

import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Link as IntlLink } from "@/i18n/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import type { LoginType } from "@/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

type LoginFormProps = {
  loginType?: LoginType;
  title: string;
  subtitle: string;
  showRegisterLink?: boolean;
  showForgotPassword?: boolean;
  defaultCallbackUrl?: string;
};

export default function LoginForm({
  loginType = "customer",
  title,
  subtitle,
  showRegisterLink = false,
  showForgotPassword = true,
  defaultCallbackUrl = "/account",
}: LoginFormProps) {
  const t = useTranslations("Auth");
  // Admin login lives outside app/[locale] (no next-intl context there), so
  // it must keep plain next/link; the customer login form uses the
  // locale-aware Link to preserve /en, /ru prefixes on navigation.
  const Link = loginType === "admin" ? NextLink : IntlLink;
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? defaultCallbackUrl;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      loginType,
      redirect: false,
    });

    if (result?.error) {
      setServerError(t("invalidCredentials"));
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-accent">
          Yapinci
        </p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label={t("emailLabel")}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label={t("passwordLabel")}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error" role="alert">
            {serverError}
          </p>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          {t("loginCta")}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        {showForgotPassword && (
          <Link
            href="/forgot-password"
            className="text-muted transition-colors hover:text-accent"
          >
            {t("forgotPasswordLink")}
          </Link>
        )}

        {showRegisterLink && (
          <p className="text-muted">
            {t("noAccountText")}{" "}
            <Link href="/register" className="text-foreground hover:text-accent">
              {t("registerLink")}
            </Link>
          </p>
        )}

        {loginType === "admin" && (
          <Link href="/" className="text-xs tracking-[0.1em] uppercase text-muted hover:text-foreground">
            {t("backToShop")}
          </Link>
        )}
      </div>
    </Card>
  );
}
