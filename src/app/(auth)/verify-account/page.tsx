import { AuthShell } from "@/components/auth/auth-shell";
import { VerificationForm } from "@/components/auth/verification-form";

type VerifyAccountPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyAccountPage({
  searchParams,
}: VerifyAccountPageProps) {
  const { email = "admin@fikitransit.com" } = await searchParams;

  return (
    <AuthShell
      description="Enter the 6-digit code sent to your email to continue."
      eyebrow="Email verification"
      title="Verify your account"
    >
      <VerificationForm email={email} />
    </AuthShell>
  );
}
