import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, BadgeCheck, BookOpen, MessageCircle, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { schoolContacts, schoolEmail } from "@/lib/contact";
import { blackFridayCoursePrices, formatCoursePrice } from "@/lib/course-prices";

const programs = [
  {
    title: "Occupational Health & Safety",
    desc: "Build the skills to make every workplace safer.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85",
    tag: "Career-ready training",
  },
  {
    title: "Home Based Care",
    desc: "Make a meaningful difference in the lives of others.",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=85",
    tag: "Care with purpose",
  },
  {
    title: "Professional Short Courses",
    desc: "Focused courses and bundles for practical skills.",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=85",
    tag: "Flexible learning",
  },
];

const facts = [
  { value: "4", label: "Branches across South Africa" },
  { value: "10", label: "Featured course prices" },
  { value: "2026", label: "Applications now open" },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="relative isolate flex min-h-[640px] items-center overflow-hidden bg-navy sm:min-h-[700px] lg:min-h-[760px]">
          <Image
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2200&q=90"
            alt="Graduates celebrating together after completing their studies"
            fill
            priority
            sizes="100vw"
            className="z-0 object-cover object-center"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#08182B]/95 via-[#14263D]/80 to-[#14263D]/30" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#08182B]/55 via-transparent to-[#08182B]/10" />

          <div className="relative z-20 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-24 pt-20 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-28">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-white/90 sm:text-sm">
                <span className="h-px w-9 bg-gold" />
                Jaligos Training &amp; Skills Development Centre
              </p>
              <h1 className="mt-7 max-w-3xl font-serif text-5xl font-bold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Make your next move a <span className="text-gold">qualification.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                Accredited training in occupational safety, compliance and care, delivered across four branches and online.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-sm bg-action px-7 font-heading text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-black/20 transition hover:bg-gold-dark"
                >
                  Start your application <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#programs"
                  className="inline-flex min-h-14 items-center justify-center gap-3 border border-white/50 px-7 font-heading text-sm font-bold uppercase tracking-wider text-white transition hover:border-white hover:bg-white/10"
                >
                  Explore programs <ArrowDown size={16} />
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/75">
                <span className="inline-flex items-center gap-2"><BadgeCheck size={17} className="text-gold" /> Accredited training</span>
                <span className="inline-flex items-center gap-2"><BookOpen size={17} className="text-gold" /> Practical learning</span>
              </div>
            </div>

            <div className="hidden justify-end lg:flex">
              <div className="w-full max-w-sm border border-white/30 bg-[#08182B]/70 p-7 text-white shadow-2xl backdrop-blur-md">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">Jaligos · 2026 intake</p>
                <p className="mt-4 font-serif text-3xl font-bold leading-tight">Training for safer workplaces and stronger communities.</p>
                <div className="mt-7 border-t border-white/20 pt-5">
                  <p className="text-sm leading-6 text-white/75">Applications are open for our 2026 programmes across four branches.</p>
                  <Link href="/register" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-gold">
                    Find your course <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/15 bg-[#08182B]/70 backdrop-blur-sm">
            <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-white/15 px-3 sm:px-10 lg:px-12">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col items-start gap-1 px-3 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-5 first:sm:pl-0">
                  <span className="font-serif text-xl font-bold text-white sm:text-3xl">{fact.value}</span>
                  <span className="max-w-40 text-[10px] leading-4 text-white/75 sm:text-sm sm:leading-5">{fact.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PromoBanner />

        <section id="programs" className="bg-white px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-action">Find your direction</p>
                <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-navy sm:text-5xl">A programme for the work you want to do.</h2>
              </div>
              <Link href="/register" className="inline-flex items-center gap-2 self-start border-b border-action pb-2 text-sm font-bold text-navy transition hover:text-action md:self-auto">
                View all courses <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-11 grid gap-5 md:grid-cols-3">
              {programs.map((program, index) => (
                <Link
                  key={program.title}
                  href="/register"
                  className="group relative isolate flex min-h-[390px] flex-col justify-end overflow-hidden bg-navy p-6 text-white sm:min-h-[440px] sm:p-8"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={program.image} alt="" className="absolute inset-0 z-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#08182B]/95 via-[#08182B]/35 to-transparent" />
                  <span className="absolute left-6 top-6 z-20 flex h-10 w-10 items-center justify-center border border-white/40 bg-[#08182B]/35 font-serif text-sm font-bold sm:left-8 sm:top-8">
                    0{index + 1}
                  </span>
                  <div className="relative z-20">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">{program.tag}</p>
                    <h3 className="mt-3 font-serif text-3xl font-bold leading-tight">{program.title}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">{program.desc}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white">
                      Explore programme <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="fees" className="bg-[#F5F3EE] px-6 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-action">2026 fee guide</p>
              <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-navy sm:text-5xl">Invest in skills that move you forward.</h2>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
                Explore our featured course fees and take the next step towards a recognised qualification.
              </p>
              <Link href="/register" className="mt-8 inline-flex min-h-12 items-center gap-3 bg-action px-6 font-heading text-sm font-bold uppercase tracking-wider text-white transition hover:bg-gold-dark">
                Apply today <ArrowRight size={16} />
              </Link>
            </div>
            <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between bg-navy px-5 py-4 text-white sm:px-7">
                <span className="font-heading text-xs font-bold uppercase tracking-[0.16em]">Featured qualifications</span>
                <span className="text-xs text-white/70">Fees in ZAR</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {blackFridayCoursePrices.map((course, index) => (
                  <li key={course.title} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-7">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="hidden font-heading text-xs font-semibold tabular-nums text-slate-400 sm:inline">0{index + 1}</span>
                      <span className="font-heading text-sm font-semibold text-slate-800 sm:text-base">{course.title}</span>
                    </div>
                    <span className="shrink-0 font-heading text-base font-bold text-navy sm:text-lg">{formatCoursePrice(course.price)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-slate-100 px-5 py-4 text-xs leading-5 text-slate-500 sm:px-7">
                Promotion applies to eligible applicants. Contact admissions to confirm course requirements and fees.
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="relative isolate overflow-hidden bg-navy px-6 py-20 text-white sm:py-24">
          <div aria-hidden="true" className="absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-10 -top-20 -z-10 h-64 w-64 rounded-full border border-white/10" />
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">Take the next step</p>
              <h2 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">The future you want starts with one application.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/75">Our admissions team can help you choose the right programme and campus.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/register" className="inline-flex min-h-14 items-center justify-center gap-3 bg-action px-7 font-heading text-sm font-bold uppercase tracking-wider text-white transition hover:bg-gold-dark">
                Apply now <ArrowRight size={17} />
              </Link>
              <a href={`tel:${schoolContacts[0].tel}`} className="inline-flex min-h-14 items-center justify-center gap-3 border border-white/40 px-7 font-heading text-sm font-bold uppercase tracking-wider text-white transition hover:bg-white/10">
                <Phone size={16} /> Speak to admissions
              </a>
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-7xl border-t border-white/15 pt-7">
            <div className="flex flex-col gap-5 text-sm text-white/75 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {schoolContacts.map((contact) => (
                  <a key={contact.number} href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                    <MessageCircle size={15} /> {contact.number}
                  </a>
                ))}
              </div>
              <a href={`mailto:${schoolEmail}`} className="break-all font-semibold text-white underline underline-offset-4 hover:text-slate-200">{schoolEmail}</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
