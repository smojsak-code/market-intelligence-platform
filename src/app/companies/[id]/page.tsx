import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ConfidenceBadge } from "@/components/confidence-badge";
import type { CompanyTimelineEvent, Signal } from "@/lib/types";

export default async function CompanyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase } = await requireUser();

  const [{ data: company }, { data: signals }, { data: timeline }] =
    await Promise.all([
      supabase.from("companies").select("*").eq("id", params.id).single(),
      supabase
        .from("signals")
        .select(
          "id, category, headline, description, evidence_excerpt, confidence_label, magnitude, strategic_relevance, occurred_at, detected_at, requires_review, company_id"
        )
        .eq("company_id", params.id)
        .order("detected_at", { ascending: false }),
      supabase
        .from("company_timeline_events")
        .select("*")
        .eq("company_id", params.id)
        .order("occurred_at", { ascending: false }),
    ]);

  if (!company) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">{company.name}</h1>
        <p className="mt-1 text-sm text-slate-400">{company.description}</p>
        <div className="mt-3 flex gap-4 text-xs text-slate-400">
          <span>GTM: {company.gtm_model?.replace(/_/g, " ") ?? "—"}</span>
          <span>AI maturity: {company.ai_maturity_level ?? "—"} / 5</span>
          <span>
            Classification:{" "}
            {company.lifecycle_classification?.replace(/_/g, " ") ?? "—"}
          </span>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Structured signals (evidence chain)
        </h2>
        {!signals?.length ? (
          <p className="text-sm text-slate-400">
            No signals recorded for this company yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {(signals as Signal[]).map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-vault-border bg-vault-panel p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    {s.category.replace(/_/g, " ")} · {s.magnitude} magnitude ·{" "}
                    {s.strategic_relevance} relevance
                  </span>
                  <ConfidenceBadge label={s.confidence_label} />
                </div>
                <h3 className="mt-1 font-medium">{s.headline}</h3>
                {s.description && (
                  <p className="mt-1 text-sm text-slate-300">{s.description}</p>
                )}
                {s.evidence_excerpt && (
                  <blockquote className="mt-2 border-l-2 border-vault-accent pl-3 text-xs italic text-slate-400">
                    "{s.evidence_excerpt}"
                  </blockquote>
                )}
                {s.requires_review && (
                  <p className="mt-2 text-xs text-amber-400">
                    Flagged for human review
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Company change timeline
        </h2>
        {!timeline?.length ? (
          <p className="text-sm text-slate-400">No timeline events yet.</p>
        ) : (
          <ol className="relative flex flex-col gap-4 border-l border-vault-border pl-4">
            {(timeline as CompanyTimelineEvent[]).map((e) => (
              <li key={e.id}>
                <p className="text-xs text-slate-500">
                  {new Date(e.occurred_at).toLocaleDateString()} ·{" "}
                  {e.event_type.replace(/_/g, " ")}
                </p>
                <p className="text-sm font-medium">{e.title}</p>
                {e.description && (
                  <p className="text-sm text-slate-400">{e.description}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
