import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ConfidenceBadge } from "@/components/confidence-badge";
import type { Alert, Signal } from "@/lib/types";

export default async function DashboardPage() {
  const { supabase } = await requireUser();

  const [{ data: alerts }, { data: signals }, { data: companies }] =
    await Promise.all([
      supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("signals")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(8),
      supabase.from("companies").select("id, name"),
    ]);

  const companyName = (id: string) =>
    companies?.find((c) => c.id === id)?.name ?? "Unknown company";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Critical changes, top movements and recommended actions across your
          watchlist.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Action-oriented alerts
        </h2>
        {!alerts?.length ? (
          <EmptyState
            title="No alerts yet"
            body="Alerts appear once the ingestion pipeline detects a material change. Run the ingestion example script to see one end-to-end."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {(alerts as Alert[]).map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-vault-border bg-vault-panel p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    {companyName(a.company_id)} · {a.level}
                  </span>
                  {a.confidence_label && (
                    <ConfidenceBadge label={a.confidence_label} />
                  )}
                </div>
                <h3 className="mt-1 font-medium">{a.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{a.what_changed}</p>
                {a.why_it_matters && (
                  <p className="mt-1 text-sm text-slate-400">
                    Why it matters: {a.why_it_matters}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Recent signals
        </h2>
        {!signals?.length ? (
          <EmptyState
            title="No signals yet"
            body="The Data Vault is empty. Seed source documents and run the ingestion pipeline to populate structured signals."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {(signals as Signal[]).map((s) => (
              <Link
                key={s.id}
                href={`/companies/${s.company_id}`}
                className="flex items-center justify-between rounded-lg border border-vault-border bg-vault-panel px-4 py-3 hover:border-vault-accent"
              >
                <div>
                  <span className="text-xs uppercase text-slate-400">
                    {companyName(s.company_id)} · {s.category.replace(/_/g, " ")}
                  </span>
                  <p className="text-sm">{s.headline}</p>
                </div>
                <ConfidenceBadge label={s.confidence_label} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-vault-border p-6 text-sm text-slate-400">
      <p className="font-medium text-slate-300">{title}</p>
      <p className="mt-1">{body}</p>
    </div>
  );
}
