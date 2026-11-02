"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, Monitor, X } from "lucide-react";
import Logo from "./Logo";

const navItems = [
  { label: "About Us", links: ["Our Story", "Accreditation", "Why Jaligos"] },
  { label: "Our Courses", links: ["Safety Courses", "Home Based Care", "4-in-1 Combos"] },
  { label: "Admissions", links: ["How to Apply", "Fees & Payments", "Requirements"] },
  { label: "Branches", links: ["Johannesburg", "Sebokeng", "QwaQwa", "Limpopo"] },
  { label: "Contact Us", links: ["Call Us", "WhatsApp", "Email"] },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Top bar */}
      <div className="hidden bg-gray-100 text-xs text-slate-600 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex gap-6">
            <Link href="#" className="hover:text-navy">Payments and Fees</Link>
            <Link href="#" className="hover:text-navy">Assist</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-navy">Current Students</Link>
            <Link href="/login" className="hover:text-navy">Staff Portal</Link>
            <Link href="#" className="flex items-center gap-1 font-semibold text-navy hover:text-gold-dark">
              <Monitor size={14} /> Study Online
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <div key={item.label} className="group relative">
                <button className="flex items-center gap-1 px-3 py-2 font-heading text-sm font-semibold text-navy hover:text-gold-dark">
                  {item.label} <ChevronDown size={14} />
                </button>
                <div className="invisible absolute left-0 top-full min-w-[200px] rounded-md border-t-2 border-gold bg-white py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                  {item.links.map((l) => (
                    <Link key={l} href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-50 hover:text-navy">
                      {l}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link
              href="/register"
              className="ml-3 rounded bg-action px-5 py-2.5 font-heading text-sm font-bold text-white transition hover:bg-action-dark"
            >
              Apply Now
            </Link>
          </nav>

          <button className="text-navy lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t bg-white px-6 pb-6 lg:hidden">
            {navItems.map((item) => (
              <details key={item.label} className="border-b py-3">
                <summary className="cursor-pointer font-heading text-sm font-semibold text-navy">{item.label}</summary>
                <div className="mt-2 flex flex-col gap-2 pl-3">
                  {item.links.map((l) => (
                    <Link key={l} href="#" className="text-sm text-slate-600">{l}</Link>
                  ))}
                </div>
              </details>
            ))}
            <div className="mt-4 flex gap-4 text-sm text-slate-600">
              <Link href="/login">Current Students</Link>
              <Link href="/login">Staff Portal</Link>
            </div>
            <Link href="/register" className="mt-4 block rounded bg-action py-3 text-center font-heading font-bold text-white">
              Apply Now
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
