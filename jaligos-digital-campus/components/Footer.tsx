import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import Logo from "./Logo";
import { schoolContacts, schoolEmail } from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="border-t-4 border-gold bg-navy text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.2fr] lg:gap-16 lg:py-20">
        <div>
          <Logo dark />
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
            Jaligos Training and Skills Development Centre delivers accredited safety, compliance and
            home based care qualifications that get you work-ready.
          </p>
        </div>

        <div>
          <h4 className="mb-5 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white">Study with us</h4>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><Link href="/register" className="transition hover:text-white">Occupational Safety</Link></li>
            <li><Link href="/register" className="transition hover:text-white">Home Based Care</Link></li>
            <li><Link href="/register" className="transition hover:text-white">Professional Courses</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white">Admissions</h4>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><Link href="/register" className="transition hover:text-white">Apply Online</Link></li>
            <li><Link href="/login" className="transition hover:text-white">Student Portal</Link></li>
            <li><Link href="/login" className="transition hover:text-white">Staff Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 font-heading text-xs font-bold uppercase tracking-[0.18em] text-white">Admissions support</h4>
          <ul className="space-y-3 text-sm">
            {schoolContacts.map((contact) => (
              <li key={contact.number} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Phone size={16} className="text-gold" />
                <a href={`tel:${contact.tel}`} className="font-semibold text-white hover:text-slate-200">{contact.number}</a>
                <a
                  href={`https://wa.me/${contact.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`WhatsApp ${contact.number}`}
                  className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </li>
            ))}
            <li className="flex min-w-0 items-center gap-2">
              <Mail size={16} className="shrink-0 text-gold" />
              <a href={`mailto:${schoolEmail}`} className="break-all hover:text-white">{schoolEmail}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Jaligos Training and Skills Development Centre. Built by Bekhukha Tech Solutions.
      </div>
    </footer>
  );
}
