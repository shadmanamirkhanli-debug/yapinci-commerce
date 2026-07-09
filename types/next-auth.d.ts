import type { DefaultSession } from "next-auth";
import type { RoleSlug } from "@/lib/auth/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleSlug;
    } & DefaultSession["user"];
  }

  interface User {
    role: RoleSlug;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: RoleSlug;
  }
}

export {};
