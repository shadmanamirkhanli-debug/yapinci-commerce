"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Container from "@/components/ui/Container";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="border-t border-border bg-primary text-white">
      <Container as="section" className="py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-accent">
            Newsletter
          </p>
          <h2 className="mt-4 text-3xl font-light tracking-tight">
            Yeni Kolleksiyalardan Xəbərdar Olun
          </h2>
          <p className="mt-4 text-sm text-white/70">
            Ekskluziv təkliflər və yeni məhsullar birbaşa e-poçtunuza gəlsin.
          </p>

          {submitted ? (
            <p className="mt-8 text-sm text-accent">
              Abunəliyiniz qeydə alındı. Təşəkkür edirik!
            </p>
          ) : (
            <form
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                if (email) setSubmitted(true);
              }}
            >
              <Input
                type="email"
                label="E-poçt"
                placeholder="E-poçt ünvanınız"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                required
              />
              <Button type="submit" variant="accent">
                Abunə Ol
              </Button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
