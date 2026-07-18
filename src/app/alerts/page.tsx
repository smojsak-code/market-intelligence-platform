import { requireUser } from "@/lib/auth";
import { ConfidenceBadge } from "@/components/confidence-badge";
import type { Alert } from "@/lib/types";

const levelStyles: Record<string, string> = {
  critical: "border-red-700",
  strategic: "border-amber-700",
  emerging: "border-blue-700",
  informational: "border-vault-border",
};

export default async function AlertsPage() {
  const { supabase } = await requireUser();
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Alerts</h1>
      <p className="mt-1 text-sm text-slate-400">
        Each alert explains what changed, why it matters and what to do next.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {!alerts?.length && (
          <p className="text-sm text-slate-400">No alerts yet.</p>
        )}
        {(alerts as Alert[] | null)?.map((a) => (
          <div
            key={a.id}
            className={`rounded-lg border bg-vault-panel p-4 ${levelStyles[a.level]}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide">
                {a.level}
              </span>
              {a.confidence_label && <ConfidenceBadge label={a.confidence_label} />}
            </div>
            <h3 className="mt-1 font-medium">{a.title}</h3>
            <dl className="mt-2 grid grid-cols-1 gap-1 text-sm text-slate-300">
              <div>
                <dt className="inline text-slate-500">What changed: </dt>
                <dd className="inline">{a.what_changed}</dd>
              </div>
              {a.why_it_matters && (
                <div>
                  <dt className="inline text-slate-500">Why it matters: </dt>
                  <dd className="inline">{a.why_it_matters}</dd>
                </div>
              )}
              {a.suggested_follow_up && (
                <div>
                  <dt className="inline text-slate-500">Suggested follow-up: </dt>
                  <dd className="inline">{a.suggested_follow_up}</dd>
                </div>
              )}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
