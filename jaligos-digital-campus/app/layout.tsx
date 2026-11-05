import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import WhatsAppButton from "@/components/WhatsAppButton";
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
  metadataBase: new URL("https://jaligostraining.co.za"),
  title: {
    default: "Jaligos Training and Skills Development Centre",
    template: "%s | Jaligos Training and Skills Development Centre",
  },
  description:
    "Jaligos Training and Skills Development Centre offers accredited safety, compliance, and home based care courses in South Africa.",
  keywords: [
    "SHEMTRAC",
    "Caregiver course",
    "safety training",
    "Jaligos",
    "accredited courses South Africa",
    "home based care courses",
    "compliance training",
  ],
  openGraph: {
    type: "website",
    siteName: "Jaligos Training and Skills Development Centre",
    url: "https://jaligostraining.co.za",
    title: "Jaligos Training and Skills Development Centre",
    description:
      "Accredited safety, compliance, and home based care courses in South Africa.",
    images: [
      {
        url: "/jaligos-training-hero.jpeg",
        width: 1170,
        height: 905,
        alt: "Jaligos trainees wearing safety equipment at a construction training site",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable}`}>
      <body>
        <PromoBanner compact />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
