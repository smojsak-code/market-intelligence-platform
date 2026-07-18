import type { ConfidenceLabel } from "@/lib/types";

const styles: Record<ConfidenceLabel, string> = {
  high_confidence: "bg-emerald-900 text-emerald-300 border-emerald-700",
  moderate_confidence: "bg-blue-900 text-blue-300 border-blue-700",
  low_confidence: "bg-amber-900 text-amber-300 border-amber-700",
  early_signal: "bg-slate-800 text-slate-300 border-slate-600",
  conflicting_evidence: "bg-red-900 text-red-300 border-red-700",
  unverified: "bg-zinc-800 text-zinc-400 border-zinc-600",
};

const labels: Record<ConfidenceLabel, string> = {
  high_confidence: "High confidence",
  moderate_confidence: "Moderate confidence",
  low_confidence: "Low confidence",
  early_signal: "Early signal",
  conflicting_evidence: "Conflicting evidence",
  unverified: "Unverified",
};

export function ConfidenceBadge({ label }: { label: ConfidenceLabel }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${styles[label]}`}
    >
      {labels[label]}
    </span>
  );
}
