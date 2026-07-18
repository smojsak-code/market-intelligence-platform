import { requireUser } from "@/lib/auth";
import { saveProfile } from "./actions";

const roleViews = [
  { value: "leadership", label: "Leadership" },
  { value: "partnership_alliance", label: "Partnership & Alliance" },
  { value: "product", label: "Product" },
  { value: "sales_gtm", label: "Sales & GTM" },
  { value: "investor_strategy", label: "Investor & Strategy" },
];

export default async function IntelligenceCentrePage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Intelligence Centre</h1>
      <p className="mt-1 text-sm text-slate-400">
        Controls what is prioritised for you — not what is collected.
      </p>

      <form action={saveProfile} className="mt-6 flex flex-col gap-4">
        <Field label="Full name">
          <input
            name="full_name"
            defaultValue={profile?.full_name ?? ""}
            className="input"
          />
        </Field>
        <Field label="Job title">
          <input
            name="job_title"
            defaultValue={profile?.job_title ?? ""}
            className="input"
          />
        </Field>
        <Field label="Company name">
          <input
            name="company_name"
            defaultValue={profile?.company_name ?? ""}
            className="input"
          />
        </Field>
        <Field label="Role-based default view">
          <select
            name="role_view"
            defaultValue={profile?.role_view ?? "leadership"}
            className="input"
          >
            {roleViews.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Email summaries">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="email_enabled"
              defaultChecked={profile?.email_enabled ?? false}
            />
            <span className="text-sm text-slate-300">
              Enable scheduled email summaries
            </span>
          </div>
        </Field>
        <button
          type="submit"
          className="mt-2 w-fit rounded bg-vault-accent px-4 py-2 text-sm font-medium"
        >
          Save profile
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-400">{label}</span>
      {children}
    </label>
  );
}
