import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell>
      <div className="mt-9 text-center">
        <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-brand-yellow-hover">
          Welcome back
        </p>
        <h1 className="text-center text-[26px] font-bold leading-tight tracking-[-0.035em] text-brand-navy sm:text-[28px]">
          Sign in to your account
        </h1>
        <p className="mx-auto mt-2.5 max-w-82.5 text-center text-sm leading-6 text-brand-muted">
          Enter your credentials to access the admin portal.
        </p>
      </div>
      <LoginForm />
    </AuthShell>
  );
}
