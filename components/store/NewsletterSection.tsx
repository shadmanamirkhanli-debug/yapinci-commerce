"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Container from "@/components/ui/Container";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations("NewsletterSection");

  return (
    <section className="border-t border-border bg-secondary section-padding">
      <Container as="section">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-background px-8 py-14 text-center lg:px-16 lg:py-16">
          <p className="text-eyebrow text-accent">{t("eyebrow")}</p>
          <h2 className="text-display mt-4 text-2xl text-primary sm:text-3xl">
            {t("heading")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {t("description")}
          </p>

          {submitted ? (
            <p className="mt-8 text-sm text-accent" role="status">
              {t("thankYou")}
            </p>
          ) : (
            <form
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end"
              onSubmit={(event) => {
                event.preventDefault();
                if (email) setSubmitted(true);
              }}
            >
              <Input
                type="email"
                label={t("emailLabel")}
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" variant="primary" className="shrink-0">
                {t("subscribeCta")}
              </Button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
