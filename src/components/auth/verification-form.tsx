"use client";

import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { forgotPasswordApi, resetPasswordApi, verifyOtpApi } from "@/lib/api";

const CODE_LENGTH = 6;
const DIGIT_IDS = ["first", "second", "third", "fourth", "fifth", "sixth"];

export function VerificationForm({ email }: { email: string }) {
  const [code, setCode] = useState(Array<string>(CODE_LENGTH).fill(""));
  const [step, setStep] = useState<"VERIFY_OTP" | "SET_PASSWORD" | "SUCCESS">("VERIFY_OTP");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const maskedEmail = maskEmail(email);

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item))
    );
    if (digit && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);
    if (!pasted) return;
    const nextCode = Array<string>(CODE_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => {
      nextCode[index] = digit;
    });
    setCode(nextCode);
    inputs.current[Math.min(pasted.length, CODE_LENGTH) - 1]?.focus();
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfoMsg("");
    setLoading(true);

    const otpString = code.join("");
    const res = await verifyOtpApi(email, otpString);
    setLoading(false);

    if (res.success) {
      setStep("SET_PASSWORD");
    } else {
      setError(res.error?.message || "Invalid or expired verification code.");
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const otpString = code.join("");
    const res = await resetPasswordApi(email, otpString, newPassword);
    setLoading(false);

    if (res.success) {
      setStep("SUCCESS");
    } else {
      setError(res.error?.message || "Failed to reset password.");
    }
  }

  async function handleResendCode() {
    setResending(true);
    setError("");
    setInfoMsg("");

    const res = await forgotPasswordApi(email);
    setResending(false);

    if (res.success) {
      setInfoMsg("A new 6-digit code has been sent to your email.");
    } else {
      setError(res.error?.message || "Failed to resend verification code.");
    }
  }

  if (step === "SUCCESS") {
    return (
      <div className="mt-8 text-center" aria-live="polite">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-brand-navy">
          Password Reset Successfully!
        </h2>
        <p className="mt-2 text-sm text-brand-muted">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Link className={`${primaryButtonClass} mt-6`} href="/login">
          Continue to Sign In
        </Link>
      </div>
    );
  }

  if (step === "SET_PASSWORD") {
    return (
      <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
        <div className="mx-auto flex w-fit max-w-full items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
          <CheckCircle2 className="size-3.5 shrink-0" />
          <span>Code verified. Set your new password.</span>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs font-bold text-brand-label">
            New Password
          </label>
          <div className="flex h-12 items-center gap-3 rounded-full border border-input bg-muted px-4 hover:border-muted-foreground focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/10">
            <Lock className="size-4.25 shrink-0 text-brand-icon" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-brand-navy outline-none placeholder:text-brand-placeholder/80"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-brand-label">
            Confirm New Password
          </label>
          <div className="flex h-12 items-center gap-3 rounded-full border border-input bg-muted px-4 hover:border-muted-foreground focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/10">
            <KeyRound className="size-4.25 shrink-0 text-brand-icon" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              minLength={6}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-brand-navy outline-none placeholder:text-brand-placeholder/80"
            />
          </div>
        </div>

        <button className={primaryButtonClass} disabled={loading} type="submit">
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Reset Password"}
        </button>
      </form>
    );
  }

  return (
    <form className="mt-8" onSubmit={handleVerifyOtp}>
      <div className="mx-auto flex w-fit max-w-full items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-3 py-2 text-[11px] text-brand-muted [&_strong]:truncate [&_strong]:font-bold [&_strong]:text-brand-navy">
        <Mail aria-hidden="true" className="size-3.5 shrink-0 text-sky-600" />
        <span>Code sent to</span>
        <strong>{maskedEmail}</strong>
      </div>

      {infoMsg && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-semibold text-blue-700">
          {infoMsg}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <fieldset className="mt-7">
        <legend className="sr-only">6-digit verification code</legend>
        <div className="grid grid-cols-6 gap-2">
          {code.map((digit, index) => (
            <input
              aria-label={`Digit ${index + 1}`}
              className="h-12 w-full min-w-0 rounded-xl border border-brand-border bg-brand-input text-center text-xl font-bold text-brand-navy caret-brand-yellow outline-none transition focus:border-brand-navy/40 focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
              inputMode="numeric"
              key={DIGIT_IDS[index]}
              maxLength={1}
              onChange={(event) => updateDigit(index, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !code[index] && index > 0)
                  inputs.current[index - 1]?.focus();
              }}
              onPaste={handlePaste}
              ref={(element) => {
                inputs.current[index] = element;
              }}
              value={digit}
            />
          ))}
        </div>
      </fieldset>

      <div className="mt-5 flex items-center justify-between text-xs">
        <span className="text-brand-muted">Didn’t receive the code?</span>
        <button
          className={inlineLinkClass}
          type="button"
          disabled={resending}
          onClick={handleResendCode}
        >
          {resending ? "Sending..." : "Resend code"}
        </button>
      </div>

      <button
        className={`${primaryButtonClass} mt-7`}
        disabled={code.some((digit) => !digit) || loading}
        type="submit"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Verify Code"}
      </button>

      <Link className={`${backLinkClass} mt-5`} href="/forgot-password">
        <ArrowLeft aria-hidden="true" className="size-3.5" /> Change email
      </Link>
    </form>
  );
}

const primaryButtonClass =
  "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";
const inlineLinkClass =
  "font-bold text-brand-navy transition hover:text-brand-yellow-hover focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy disabled:opacity-50";
const backLinkClass =
  "flex items-center justify-center gap-1.5 text-xs font-bold text-brand-muted transition hover:text-brand-navy focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";

function maskEmail(email: string) {
  if (!email || !email.includes("@")) return email;
  const [name = "admin", domain = "email.com"] = email.split("@");
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"•".repeat(Math.max(3, name.length - visible.length))}@${domain}`;
}
