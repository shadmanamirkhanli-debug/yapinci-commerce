import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const locales = ["az", "en", "ru"] as const;
type Locale = (typeof locales)[number];

function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const candidate = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = isLocale(candidate) ? candidate : "az";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
