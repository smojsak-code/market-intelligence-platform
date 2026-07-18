import { requireUser } from "@/lib/auth";

export default async function ReviewQueuePage() {
  const { supabase } = await requireUser();
  const { data: items } = await supabase
    .from("review_queue")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold">Review Queue</h1>
      <p className="mt-1 text-sm text-slate-400">
        Low-confidence signals, ambiguous entity matches and contradictory
        evidence awaiting human review.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-vault-border">
        <table className="w-full text-sm">
          <thead className="bg-vault-panel text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Item type</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {!items?.length && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Queue is empty.
                </td>
              </tr>
            )}
            {items?.map((i) => (
              <tr key={i.id} className="border-t border-vault-border">
                <td className="px-4 py-3">{i.item_type}</td>
                <td className="px-4 py-3 text-slate-300">{i.reason}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-vault-border px-2 py-0.5 text-xs">
                    {i.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(i.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
