import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { ADMIN_ROLES, ROLES, type RoleSlug } from "@/lib/auth/roles";
import { loginSchema } from "@/lib/validations/auth";

export type LoginType = "customer" | "admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });

        if (!parsed.success) {
          return null;
        }

        const loginType = (credentials?.loginType as LoginType) ?? "customer";

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { role: true },
        });

        if (!user) {
          return null;
        }

        const isValidPassword = await verifyPassword(
          parsed.data.password,
          user.password
        );

        if (!isValidPassword) {
          return null;
        }

        const roleSlug = user.role.slug as RoleSlug;

        if (loginType === "admin" && !ADMIN_ROLES.includes(roleSlug)) {
          return null;
        }

        if (loginType === "customer" && roleSlug !== ROLES.CUSTOMER) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: roleSlug,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as RoleSlug;
      }

      return session;
    },
  },
});
