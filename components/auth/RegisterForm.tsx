"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      setServerError(result.error ?? "Qeydiyyat zamanı xəta baş verdi");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      loginType: "customer",
      redirect: false,
    });

    if (signInResult?.error) {
      router.push("/login");
      return;
    }

    router.push("/account");
    router.refresh();
  };

  return (
    <Card variant="elevated" padding="lg" className="w-full max-w-md">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-accent">
          Yapinci
        </p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground">
          Qeydiyyat
        </h1>
        <p className="mt-2 text-sm text-muted">
          Yeni hesab yaradın və kolleksiyanı kəşf edin
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Ad, Soyad"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="E-poçt"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Şifrə"
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
          Qeydiyyatdan Keç
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Artıq hesabınız var?{" "}
        <Link href="/login" className="text-foreground hover:text-accent">
          Daxil olun
        </Link>
      </p>
    </Card>
  );
}
