import Link from "next/link";
import { requireUser } from "@/lib/auth";
import type { Company } from "@/lib/types";

export default async function CompaniesPage() {
  const { supabase } = await requireUser();
  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .order("name");

  return (
    <div>
      <h1 className="text-xl font-semibold">Companies</h1>
      <p className="mt-1 text-sm text-slate-400">
        {companies?.length ?? 0} companies on your watchlist.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-vault-border">
        <table className="w-full text-sm">
          <thead className="bg-vault-panel text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">GTM model</th>
              <th className="px-4 py-3">AI maturity</th>
              <th className="px-4 py-3">Classification</th>
            </tr>
          </thead>
          <tbody>
            {(companies as Company[] | null)?.map((c) => (
              <tr
                key={c.id}
                className="border-t border-vault-border hover:bg-vault-panel"
              >
                <td className="px-4 py-3">
                  <Link href={`/companies/${c.id}`} className="font-medium hover:text-vault-accent">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {c.gtm_model?.replace(/_/g, " ") ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {c.ai_maturity_level ? `${c.ai_maturity_level} / 5` : "—"}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {c.lifecycle_classification?.replace(/_/g, " ") ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
