// Force dynamic rendering: avoids statically prerendering a page whose
// client component touches Supabase env vars, which previously broke builds
// when those vars weren't yet configured on the hosting platform.
export const dynamic = "force-dynamic";

import LoginForm from "./login-form";

export default function LoginPage() {
  return <LoginForm />;
}
