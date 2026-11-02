import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import ChatBot from "@/components/ChatBot";
import PromoBanner from "@/components/PromoBanner";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-montserrat",
});
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Jaligos Digital Campus",
  description:
    "Jaligos Training and Skills Development Centre — accredited safety, home based care and compliance courses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable}`}>
      <body>
        <PromoBanner compact />
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
