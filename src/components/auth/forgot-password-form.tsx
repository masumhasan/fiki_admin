"use client";

import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Loader2 } from "lucide-react";
import { forgotPasswordApi } from "@/lib/api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await forgotPasswordApi(email);
    setLoading(false);

    if (res.success) {
      setSent(true);
    } else {
      setError(res.error?.message || "Failed to send verification code");
    }
  }

  if (sent) {
    return (
      <div className="mt-8 text-center" aria-live="polite">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-brand-navy">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm leading-6 text-brand-muted">
          We sent a 6-digit verification code to <strong>{email}</strong>.
        </p>
        <Link
          className={`${primaryButtonClass} mt-6`}
          href={`/verify-account?email=${encodeURIComponent(email)}`}
        >
          Enter verification code
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label
          className="mb-2 block text-xs font-bold text-brand-label"
          htmlFor="recovery-email"
        >
          Email address
        </label>
        <div className="flex h-12 items-center gap-3 rounded-full border border-input bg-muted px-4 transition-colors hover:border-muted-foreground focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/10">
          <Mail
            aria-hidden="true"
            className="size-4.25 shrink-0 text-brand-icon"
          />
          <input
            autoComplete="email"
            id="recovery-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your admin email"
            required
            type="email"
            value={email}
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-brand-navy outline-none placeholder:text-brand-placeholder/80"
          />
        </div>
      </div>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}
      <button className={primaryButtonClass} disabled={loading} type="submit">
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Send verification code"}
      </button>
      <Link className={backLinkClass} href="/login">
        <ArrowLeft aria-hidden="true" className="size-3.5" /> Back to sign in
      </Link>
    </form>
  );
}

const primaryButtonClass =
  "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";
const backLinkClass =
  "flex items-center justify-center gap-1.5 text-xs font-bold text-brand-muted transition hover:text-brand-navy focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";
