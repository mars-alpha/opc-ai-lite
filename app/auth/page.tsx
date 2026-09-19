import Link from "next/link";
import { AuthForm } from "../../components/AuthForm";

type AuthSearchParams = Promise<{
  mode?: string;
  courseSlug?: string;
  returnTo?: string;
}>;

export default async function AuthPage({
  searchParams
}: {
  searchParams: AuthSearchParams;
}) {
  const params = await searchParams;
  const initialMode = params.mode === "login" ? "login" : "register";

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="auth-brand" href="/">
          <img src="/opc-logo.png" alt="OPC AI" />
          <span>OPC AI</span>
        </Link>
        <AuthForm
          initialMode={initialMode}
          courseSlug={params.courseSlug}
          returnTo={params.returnTo}
        />
      </div>
    </main>
  );
}


