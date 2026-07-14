"use client";

import { signOut } from "next-auth/react";
import Button from "@/components/ui/Button";

type LogoutButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  label: string;
  callbackUrl?: string;
};

export default function LogoutButton({
  variant = "ghost",
  label,
  callbackUrl = "/",
}: LogoutButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={() => signOut({ callbackUrl })}
    >
      {label}
    </Button>
  );
}
