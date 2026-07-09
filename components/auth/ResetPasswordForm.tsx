"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      setServerError(result.error ?? "Şifrə yenilənərkən xəta baş verdi");
      return;
    }

    router.push("/login");
  };

  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-accent">
          Yapinci
        </p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground">
          Yeni Şifrə
        </h1>
        <p className="mt-2 text-sm text-muted">Yeni şifrənizi təyin edin</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register("token")} />

        <Input
          label="Yeni şifrə"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Şifrəni təsdiqləyin"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {serverError && (
          <p className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error" role="alert">
            {serverError}
          </p>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Şifrəni Yenilə
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="text-foreground hover:text-accent">
          ← Girişə qayıt
        </Link>
      </p>
    </Card>
  );
}
