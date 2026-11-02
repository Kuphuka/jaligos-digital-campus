import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

type PromoBannerProps = {
  compact?: boolean;
};

export default function PromoBanner({ compact = false }: PromoBannerProps) {
  if (compact) {
    return (
      <div className="bg-navy px-4 py-2 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs sm:text-sm">
          <span className="font-heading font-bold tracking-wide text-white">BLACK FRIDAY 2026</span>
          <span className="hidden text-white/70 sm:inline">Free compulsory graduation for the first 30 registered students.</span>
          <Link href="/register" className="inline-flex items-center gap-1 font-bold text-white underline underline-offset-2 hover:text-gold">
            Apply now <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby="black-friday-heading" className="relative overflow-hidden bg-navy px-6 py-14 text-white sm:py-16 lg:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-gold/20 sm:h-96 sm:w-96" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-14 h-52 w-52 rounded-full border border-gold/10 sm:h-72 sm:w-72" />
      <div className="relative mx-auto max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white sm:text-sm">
          <Sparkles size={15} aria-hidden="true" />
          Limited-time student offer
        </div>
        <h2 id="black-friday-heading" className="mt-5 font-heading text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
          BLACK FRIDAY PROMOTION 2026
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/85 sm:text-lg">
          Register now for a FREE Compulsory Graduation! Only applies to the first 30 registered students who pay the registration fee before 30 November 2026.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/10 px-4 py-2 text-sm font-semibold text-white">
          <span className="h-2 w-2 rounded-full bg-gold motion-safe:animate-pulse" aria-hidden="true" />
          Valid Until: <time dateTime="2026-11-30">30 November 2026</time>
        </div>
        <div className="mt-8">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-8 py-3.5 font-heading text-base font-extrabold text-navy shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-gold-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Apply Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
