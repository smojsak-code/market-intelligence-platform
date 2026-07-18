import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/companies", label: "Companies" },
  { href: "/alerts", label: "Alerts" },
  { href: "/reports", label: "Reports" },
  { href: "/review-queue", label: "Review Queue" },
  { href: "/intelligence-centre", label: "Intelligence Centre" },
];

export function Nav() {
  return (
    <nav className="border-b border-vault-border bg-vault-panel">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <span className="font-semibold tracking-tight">
          Market Intelligence Platform
        </span>
        <div className="flex gap-4 text-sm text-slate-300">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
