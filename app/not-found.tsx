import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container as="section" className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
        404
      </p>
      <h1 className="mt-4 font-serif text-3xl text-foreground">
        Səhifə tapılmadı
      </h1>
      <p className="mt-4 max-w-md text-sm text-muted">
        Axtardığınız səhifə mövcud deyil və ya köçürülüb.
      </p>
      <div className="mt-8 flex gap-4">
        <Button href="/">Ana səhifə</Button>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center px-6 text-xs font-medium uppercase tracking-[0.15em] text-accent hover:underline"
        >
          Mağaza
        </Link>
      </div>
    </Container>
  );
}
