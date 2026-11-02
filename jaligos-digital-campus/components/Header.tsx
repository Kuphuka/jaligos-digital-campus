"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import Logo from "./Logo";
import { schoolContacts, schoolEmail } from "@/lib/contact";

const navItems = [
  { label: "Study areas", href: "/#programs" },
  { label: "Course fees", href: "/#fees" },
  { label: "Admissions", href: "/register" },
  { label: "Student portal", href: "/login" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-navy text-xs text-white/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-2 sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href={`tel:${schoolContacts[0].tel}`} className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-gold">
              <Phone size={13} /> {schoolContacts[0].number}
            </a>
            <a href={`mailto:${schoolEmail}`} className="inline-flex min-w-0 items-center gap-1.5 break-all text-white/85 hover:text-white sm:break-normal">
              <Mail size={13} /> {schoolEmail}
            </a>
          </div>
          <div className="hidden items-center gap-2 text-white/80 md:flex">
            <MapPin size={13} className="text-gold" />
            <span>Johannesburg · Sebokeng · QwaQwa · Limpopo</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 sm:py-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Logo />
            <span className="h-9 w-px bg-slate-200" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block font-heading text-xs font-extrabold uppercase tracking-[0.16em] text-navy sm:text-sm">Jaligos</span>
              <span className="mt-0.5 block max-w-40 text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-slate-500 sm:max-w-none sm:text-[10px]">
                Training &amp; Skills Development
              </span>
            </span>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-2 font-heading text-[11px] font-bold uppercase tracking-wider text-navy transition hover:text-gold-dark xl:text-xs"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/register"
              className="ml-3 inline-flex min-h-11 items-center gap-2 bg-action px-5 font-heading text-xs font-bold uppercase tracking-wider text-white transition hover:bg-gold-dark"
            >
              Apply Now <ArrowRight size={15} />
            </Link>
          </nav>

          <button
            className="rounded-full p-2 text-navy transition hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div id="mobile-navigation" className="border-t border-slate-100 bg-white px-6 pb-6 lg:hidden">
            <nav aria-label="Mobile navigation" className="mx-auto max-w-7xl">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-slate-100 py-4 font-heading text-sm font-semibold text-navy transition hover:text-gold-dark"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/register" onClick={() => setOpen(false)} className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-action py-3 font-heading text-sm font-bold uppercase tracking-wider text-white hover:bg-navy-light">
                Apply now <ArrowRight size={16} />
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
