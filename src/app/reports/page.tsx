import { requireUser } from "@/lib/auth";

export default async function ReportsPage() {
  const { supabase } = await requireUser();
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("generated_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Reports</h1>
      <p className="mt-1 text-sm text-slate-400">
        Daily, weekly, monthly and on-demand intelligence reports generated
        from the Data Vault.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {!reports?.length && (
          <p className="text-sm text-slate-400">
            No reports generated yet. Reports are produced by the scheduled
            reporting job (Release 1 exit criteria) once signals accumulate.
          </p>
        )}
        {reports?.map((r) => (
          <div
            key={r.id}
            className="rounded-lg border border-vault-border bg-vault-panel p-4"
          >
            <span className="text-xs uppercase text-slate-400">
              {r.report_type} · {new Date(r.generated_at).toLocaleDateString()}
            </span>
            <h3 className="mt-1 font-medium">{r.title}</h3>
            {r.executive_summary && (
              <p className="mt-1 text-sm text-slate-300">
                {r.executive_summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
