"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function saveProfile(formData: FormData) {
  const { supabase, user } = await requireUser();

  const payload = {
    id: user.id,
    email: user.email,
    full_name: formData.get("full_name") as string,
    job_title: formData.get("job_title") as string,
    company_name: formData.get("company_name") as string,
    role_view: formData.get("role_view") as string,
    email_enabled: formData.get("email_enabled") === "on",
    updated_at: new Date().toISOString(),
  };

  await supabase.from("profiles").upsert(payload);
  revalidatePath("/intelligence-centre");
}
