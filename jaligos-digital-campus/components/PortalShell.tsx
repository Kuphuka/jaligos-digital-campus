"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import { createClient } from "@/lib/supabase/client";

interface PortalShellProps {
  children: React.ReactNode;
  profile?: { full_name?: string; email?: string; role?: string; name?: string };
  title: string;
  subtitle?: string;
}

export default function PortalShell({ children, profile, title, subtitle }: PortalShellProps) {
  const router = useRouter();
  const supabase = createClient();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  
  const nameToUse = profile?.full_name || profile?.name || profile?.email || "User";
  const initials = nameToUse
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex flex-col">
      {/* Luxury Top Navigation */}
      <header className="bg-navy text-white py-5 px-8 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label="Jaligos home">
            <img src="/logo.png" alt="Jaligos" className="h-10 w-auto max-w-[180px] object-contain" />
          </Link>
          <div className="h-6 w-px bg-gray-600"></div>
          <span className="text-sm font-heading font-semibold tracking-widest text-gray-300 uppercase">
            {title} {subtitle && <span className="text-gray-400 normal-case tracking-normal ml-2 font-sans text-xs">- {subtitle}</span>}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm hidden md:block text-gray-300 font-sans">{profile?.email || "admin@jaligos.co.za"}</span>
          <div className="w-10 h-10 rounded-full bg-gold text-navy flex items-center justify-center font-heading font-bold text-sm shadow-lg">
            {initials}
          </div>
          <button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            className="text-sm font-heading font-semibold text-gray-300 hover:text-gold transition-colors duration-300"
          >
            Change Password
          </button>
          <button onClick={handleLogout} className="text-sm font-heading font-semibold text-gray-300 hover:text-gold transition-colors duration-300">
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      {passwordModalOpen && <ChangePasswordModal onClose={() => setPasswordModalOpen(false)} />}
    </div>
  );
}