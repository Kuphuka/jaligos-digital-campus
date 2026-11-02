"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { schoolContacts } from "@/lib/contact";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 320);

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <a
      href={`https://wa.me/${schoolContacts[0].whatsapp}?text=${encodeURIComponent("Hello Jaligos, I would like to enquire about your courses.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Jaligos on WhatsApp"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-5 right-4 z-[60] inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-gold/60 bg-navy px-4 text-white shadow-xl shadow-navy/25 transition duration-300 hover:bg-navy-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:bottom-7 sm:right-7 sm:px-5 ${
        visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100 motion-safe:animate-[whatsapp-pop_450ms_ease-out_both]"
          : "pointer-events-none translate-y-3 scale-90 opacity-0"
      }`}
    >
      <MessageCircle size={20} className="text-gold" aria-hidden="true" />
      <span className="text-sm font-semibold">WhatsApp</span>
    </a>
  );
}
