"use client";

import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveMockSession } from "@/lib/mock-auth";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    window.setTimeout(() => {
      saveMockSession(String(formData.get("email") || ""));
      router.replace("/dashboard");
    }, 650);
  }

  return (
    <form className="mt-9 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className={labelClass} htmlFor="email">
          Admin email
        </label>
        <div className={inputWrapClass}>
          <Mail
            aria-hidden="true"
            className="size-[17px] shrink-0 text-brand-icon"
          />
          <input
            autoComplete="email"
            id="email"
            name="email"
            placeholder="admin@fikitransit.com"
            required
            type="email"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass} htmlFor="password">
            Password
          </label>
          <Link className={inlineLinkClass} href="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <div className={inputWrapClass}>
          <LockKeyhole
            aria-hidden="true"
            className="size-[17px] shrink-0 text-brand-icon"
          />
          <input
            autoComplete="current-password"
            id="password"
            minLength={6}
            name="password"
            placeholder="Enter your password"
            required
            type={showPassword ? "text" : "password"}
            className={inputClass}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="-mr-1 flex size-8 items-center justify-center rounded-lg text-brand-icon transition hover:bg-brand-navy/5 hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy [&_svg]:size-[17px]"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </div>
      <button
        className={primaryButtonClass}
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <span className="size-4 animate-spin rounded-full border-2 border-brand-navy/30 border-t-brand-navy" />
        ) : null}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

const labelClass = "mb-2 block text-xs font-bold text-brand-label";
const inputWrapClass =
  "flex h-12 items-center gap-3 rounded-full border border-input bg-muted px-4 transition-colors hover:border-muted-foreground focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/10";
const inputClass =
  "h-full min-w-0 flex-1 bg-transparent text-sm text-brand-navy outline-none placeholder:text-brand-placeholder/80";
const inlineLinkClass =
  "font-bold text-brand-navy transition hover:text-brand-yellow-hover focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";
const primaryButtonClass =
  "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";
