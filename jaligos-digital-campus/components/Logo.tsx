import Link from "next/link";

export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" aria-label="Jaligos home" className="inline-flex items-center">
      <img src="/logo.png" alt="Jaligos" className="h-10 w-auto max-w-[180px] object-contain" />
    </Link>
  );
}
