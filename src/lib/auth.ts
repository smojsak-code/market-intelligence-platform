import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Require an authenticated session, or redirect to /login. */
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  return { supabase, user };
}
