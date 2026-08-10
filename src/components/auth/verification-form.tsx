"use client";

import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

const CODE_LENGTH = 6;
const DIGIT_IDS = ["first", "second", "third", "fourth", "fifth", "sixth"];

export function VerificationForm({ email }: { email: string }) {
  const [code, setCode] = useState(Array<string>(CODE_LENGTH).fill(""));
  const [verified, setVerified] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const maskedEmail = maskEmail(email);

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item)),
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

  if (verified) {
    return (
      <div className="mt-8 text-center" aria-live="polite">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-8" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-brand-navy">
          Account verified
        </h2>
        <p className="mt-2 text-sm text-brand-muted">
          Your identity has been confirmed successfully.
        </p>
        <Link className={`${primaryButtonClass} mt-6`} href="/login">
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      className="mt-8"
      onSubmit={(event) => {
        event.preventDefault();
        setVerified(true);
      }}
    >
      <div className="mx-auto flex w-fit max-w-full items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-3 py-2 text-[11px] text-brand-muted [&_strong]:truncate [&_strong]:font-bold [&_strong]:text-brand-navy">
        <Mail aria-hidden="true" className="size-3.5 shrink-0 text-sky-600" />
        <span>Code sent to</span>
        <strong>{maskedEmail}</strong>
      </div>
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
        <button className={inlineLinkClass} type="button">
          Resend code
        </button>
      </div>
      <button
        className={`${primaryButtonClass} mt-7`}
        disabled={code.some((digit) => !digit)}
        type="submit"
      >
        Verify account
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
  "font-bold text-brand-navy transition hover:text-brand-yellow-hover focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";
const backLinkClass =
  "flex items-center justify-center gap-1.5 text-xs font-bold text-brand-muted transition hover:text-brand-navy focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";

function maskEmail(email: string) {
  const [name = "admin", domain = "email.com"] = email.split("@");
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"•".repeat(Math.max(3, name.length - visible.length))}@${domain}`;
}
