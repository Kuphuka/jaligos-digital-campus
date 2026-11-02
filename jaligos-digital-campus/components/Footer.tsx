import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-[#1f2430] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo dark />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Jaligos Training and Skills Development Centre delivers accredited safety, compliance and
            home based care qualifications that get you work-ready.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm uppercase tracking-wider text-gold">Find a Qualification</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white">Safety Courses</Link></li>
            <li><Link href="#" className="hover:text-white">Home Based Care</Link></li>
            <li><Link href="#" className="hover:text-white">4-in-1 Combos</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm uppercase tracking-wider text-gold">Admissions</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/register" className="hover:text-white">Apply Online</Link></li>
            <li><Link href="#" className="hover:text-white">Fees &amp; Payments</Link></li>
            <li><Link href="/login" className="hover:text-white">Student Portal</Link></li>
            <li><Link href="/login" className="hover:text-white">Staff Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm uppercase tracking-wider text-gold">Talk to Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone size={16} className="text-gold" /> +27 00 000 0000</li>
            <li className="flex items-center gap-2"><MessageCircle size={16} className="text-gold" /> WhatsApp: +27 00 000 0000</li>
            <li className="flex items-center gap-2"><Mail size={16} className="text-gold" /> info@jaligos.co.za</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Jaligos Training and Skills Development Centre. Built by Bekhukha Tech Solutions.
      </div>
    </footer>
  );
}
