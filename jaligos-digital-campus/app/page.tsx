import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { blackFridayCoursePrices, formatCoursePrice } from "@/lib/course-prices";

const courseCards = [
  {
    title: "Safety Courses",
    desc: "SHEMTRAC, SHE Rep, First Aid and more.",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=70",
  },
  {
    title: "Home Based Care",
    desc: "Caregiver Level 3 qualification.",
    img: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=70",
  },
  {
    title: "4-in-1 Combos",
    desc: "Compliance & Safety bundled together.",
    img: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=70",
  },
];

const stats = [
  { value: "4", label: "Branches" },
  { value: "100%", label: "Accredited" },
  { value: "30", label: "Promo Spots Left" },
  { value: "R2.5k", label: "Starting Fee" },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="grid min-h-[560px] lg:grid-cols-[45fr_55fr]">
          <div className="flex items-center bg-navy px-6 py-16 sm:px-12 lg:px-16">
            <div className="max-w-xl">
              <h1 className="font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                Jaligos is <span className="text-gold">Your Future</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/80">
                Accredited safety, compliance and home based care qualifications, delivered at four
                branches and online. Get certified, get hired.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/register" className="rounded bg-action px-7 py-3 font-heading font-bold text-white transition hover:bg-action-dark">
                  Apply Now
                </Link>
                <Link href="#courses" className="rounded border-2 border-gold px-7 py-3 font-heading font-bold text-gold transition hover:bg-gold hover:text-navy">
                  Explore Courses
                </Link>
              </div>
            </div>
          </div>
          <div className="relative min-h-[320px] bg-navy-light">
            <Image
              src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Safety officer wearing a hard hat"
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>

        <PromoBanner />

        {/* Courses */}
        <section id="courses" className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-center font-heading text-3xl text-navy sm:text-4xl">What would you like to study?</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-gold" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {courseCards.map((c) => (
              <Link key={c.title} href="/register" className="group relative block h-96 overflow-hidden rounded-xl bg-navy">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={c.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <h3 className="font-heading text-2xl text-white">{c.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{c.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-heading text-sm font-bold text-gold">
                    View courses <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Black Friday prices */}
        <section className="bg-gray-50 px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center font-heading text-3xl text-navy sm:text-4xl">Black Friday Course Prices</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 sm:text-base">
              Choose from our featured qualifications and apply online to secure your place.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {blackFridayCoursePrices.map((course) => (
                <div key={course.title} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-heading text-sm font-semibold text-navy sm:text-base">{course.title}</h3>
                  <span className="shrink-0 font-heading text-lg font-extrabold text-gold-dark">{formatCoursePrice(course.price)}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/register" className="inline-flex items-center gap-2 rounded bg-navy px-6 py-3 font-heading font-bold text-white transition hover:bg-navy-light">
                Apply for a course <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-navy">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 text-center lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-heading text-4xl font-extrabold text-gold sm:text-5xl">{s.value}</div>
                <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-white">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
