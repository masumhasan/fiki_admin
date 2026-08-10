import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      description="Enter your admin email and we’ll send you a secure code to reset your password."
      eyebrow="Account recovery"
      title="Forgot your password?"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
