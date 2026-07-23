import { cookies } from "next/headers";
import { randomBytes } from "crypto";

const VISITOR_COOKIE = "survey_visitor_id";
const MAX_AGE = 60 * 60 * 24 * 365;

export async function getOrCreateVisitorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const id = randomBytes(16).toString("hex");
  store.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  return id;
}
