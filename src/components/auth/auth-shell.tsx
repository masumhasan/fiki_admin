import type { ReactNode } from "react";
import { AuthBrand } from "./auth-brand";

type AuthShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-5 py-10 [@media(max-height:720px)]:justify-start [@media(max-height:720px)]:py-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-1/4 size-80 rounded-full bg-brand-yellow/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 bottom-1/4 size-80 rounded-full bg-blue-200/25 blur-3xl"
      />
      <section className="relative z-10 w-full max-w-110 rounded-[22px] border border-border bg-card px-7 py-9 shadow-[0_6px_22px_rgba(8,37,82,0.06)] sm:px-10 sm:py-10 [@media(max-height:720px)]:py-7">
        <div
          aria-hidden="true"
          className="absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-brand-yellow/70 to-transparent"
        />
        <AuthBrand />
        {title ? (
          <header className="mt-9">
            {eyebrow ? (
              <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-brand-yellow-hover">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-center text-[26px] font-bold leading-tight tracking-[-0.035em] text-brand-navy sm:text-[28px]">
              {title}
            </h1>
            {description ? (
              <p className="mx-auto mt-2.5 max-w-82.5 text-center text-sm leading-6 text-brand-muted">
                {description}
              </p>
            ) : null}
          </header>
        ) : null}
        {children}
      </section>
      <p className="relative z-10 mt-6 text-center text-xs font-medium text-brand-muted/70">
        Secure administration access
      </p>
    </main>
  );
}
