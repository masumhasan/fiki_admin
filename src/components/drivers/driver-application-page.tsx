"use client";

import {
  Archive,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Download,
  Eye,
  FileText,
  GraduationCap,
  IdCard,
  KeyRound,
  Phone,
  ShieldCheck,
  Signature,
  Upload,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

type Decision = "Pending review" | "Approved" | "Rejected";

const documents = [
  ["Resume / CV", "Verified"],
  ["Driving license (CDL-A)", "Verified"],
  ["Government-issued ID", "Verified"],
  ["Medical certificate", "Pending"],
  ["Background check authorization", "Verified"],
  ["BID form", "Missing"],
  ["Supporting documents", "Pending"],
] as const;

export function DriverApplicationPage({
  applicationId,
}: {
  applicationId: string;
}) {
  const [decision, setDecision] = useState<Decision>("Pending review");
  const [comments, setComments] = useState("");

  return (
    <div className="pb-20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-[#16345e]">
              Driver application review
            </h1>
            <DecisionBadge decision={decision} />
          </div>
          <p className="mt-1 text-xs text-brand-placeholder">{applicationId}</p>
        </div>
        <Link
          aria-label="Back to applications"
          className="flex h-9 items-center gap-2 rounded-lg border border-[#dce4ed] bg-white px-3 text-xs font-semibold text-[#52647e] transition hover:bg-muted hover:text-primary"
          href="/drivers/applications"
        >
          <ArrowLeft className="size-3.5" />
          Back to Applications
        </Link>
      </div>

      <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="space-y-4">
          <ReviewSection icon={CircleUserRound} title="Applicant information">
            <div className="grid gap-5 sm:grid-cols-[110px_1fr]">
              <div className="text-center">
                <span className="mx-auto grid size-20 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
                  MJ
                </span>
                <p className="mt-2 text-xs font-bold text-foreground">
                  Marcus Johnson
                </p>
                <p className="text-[10px] text-muted-foreground">Miami, FL</p>
              </div>
              <InfoGrid
                items={[
                  ["Full name", "Marcus Darnell Johnson"],
                  ["Email address", "marcus.johnson@gmail.com"],
                  ["Phone number", "(305) 847-2291"],
                  ["Street address", "1842 NW 17th Avenue"],
                  ["City", "Miami"],
                  ["State", "Florida"],
                  ["Postal code", "33125"],
                  ["Country", "United States"],
                ]}
              />
            </div>
          </ReviewSection>

          <ReviewSection
            icon={BriefcaseBusiness}
            title="Employment information"
          >
            <InfoGrid
              items={[
                ["Position applying for", "Driver (Ambulatory & Wheelchair)"],
                ["Employment status", "Full time"],
                ["Desired salary", "$42,000 / year"],
                ["Available start date", "January 15, 2025"],
                ["How did you hear about us", "LinkedIn job posting"],
              ]}
            />
          </ReviewSection>
          <ReviewSection icon={ShieldCheck} title="Eligibility">
            <InfoGrid
              items={[
                ["Authorized to work in US", "✓ Yes"],
                ["Felony conviction", "✓ No"],
                ["Felony explanation", "N/A — No felony conviction"],
              ]}
            />
          </ReviewSection>

          <ReviewSection icon={GraduationCap} title="Education">
            <div className="grid gap-4 sm:grid-cols-2">
              <InsetCard title="High school">
                <InfoGrid
                  items={[
                    ["School name", "Miami Senior High School"],
                    ["Graduated", "✓ Yes"],
                  ]}
                />
              </InsetCard>
              <InsetCard title="College / university">
                <InfoGrid
                  items={[
                    ["Institution", "Miami Dade College"],
                    ["Degree", "Associate of Applied Science — Transportation"],
                  ]}
                />
              </InsetCard>
            </div>
          </ReviewSection>

          <ReviewSection icon={BriefcaseBusiness} title="Employment history">
            <div className="space-y-4">
              <HistoryCard
                company="Miami-Dade Transit"
                dates="Mar 2018 – Nov 2022"
                position="Bus operator"
                salary="$36,000 → $44,000"
                reason="Seeking new opportunities in medical transport"
              />
              <HistoryCard
                company="Yellow Cab Miami"
                dates="Jan 2016 – Feb 2018"
                position="Driver / dispatcher"
                salary="$28,000 → $34,000"
                reason="Better compensation at Miami-Dade Transit"
              />
            </div>
          </ReviewSection>

          <ReviewSection icon={UsersRound} title="Professional references">
            <div className="grid gap-4 sm:grid-cols-2">
              <Reference
                initials="RA"
                name="Robert A. Diaz"
                position="Former supervisor — Miami-Dade Transit"
                phone="(305) 741-3392"
              />
              <Reference
                initials="PL"
                name="Patricia L. Moreno"
                position="HR manager — Yellow Cab Miami"
                phone="(786) 229-4871"
              />
            </div>
          </ReviewSection>
          <ReviewSection icon={KeyRound} title="Driver information">
            <InfoGrid
              items={[
                ["Driver license number", "F3847291"],
                ["Social security number", "•••-••-7821"],
                ["Date of birth", "March 14, 1987"],
                ["Years of driving experience", "7 years"],
                ["Driver category", "CDL-A (Class A)"],
                ["License expiration date", "February 14, 2025 · 14 days left"],
              ]}
            />
          </ReviewSection>

          <ReviewSection icon={FileText} title="Uploaded documents">
            <div className="grid gap-3 sm:grid-cols-2">
              {documents.map(([name, status]) => (
                <DocumentCard key={name} name={name} status={status} />
              ))}
            </div>
          </ReviewSection>
          <ReviewSection icon={Signature} title="Digital signature">
            <div className="grid h-24 place-items-center rounded-xl border border-border bg-muted/45">
              <p className="font-serif text-2xl italic text-primary/70">
                Marcus Johnson
              </p>
            </div>
            <InfoGrid
              items={[
                ["Signed by", "Marcus D. Johnson"],
                ["Signed date", "December 28, 2024 — 9:22 AM"],
                ["Verification status", "✓ Verified"],
              ]}
            />
          </ReviewSection>

          <ReviewSection icon={UserRoundCheck} title="Admin review">
            <InfoGrid
              items={[
                ["Reviewer", "Elena Castillo (HR Manager)"],
                ["Review date", "December 29, 2024"],
                ["Review status", decision],
              ]}
            />
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
              Applicant has strong transit experience. License expires
              soon—renewal confirmation is required before approval. Background
              check cleared.
            </div>
            <label
              className="mt-5 block text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
              htmlFor="admin-comments"
            >
              Admin comments
            </label>
            <textarea
              className="mt-2 min-h-24 w-full resize-y rounded-xl border border-input bg-muted p-4 text-sm outline-none placeholder:text-brand-placeholder focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
              id="admin-comments"
              onChange={(event) => setComments(event.target.value)}
              placeholder="Add an internal comment..."
              value={comments}
            />
          </ReviewSection>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <section className={sideCardClass}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Applicant summary
            </p>
            <div className="mt-5 text-center">
              <span className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground ring-4 ring-secondary/30">
                MJ
              </span>
              <h2 className="mt-3 font-bold text-foreground">Marcus Johnson</h2>
              <p className="text-xs text-muted-foreground">Miami, FL</p>
              <div className="mt-2">
                <DecisionBadge decision={decision} />
              </div>
            </div>
            <dl className="mt-5 space-y-3 border-t border-border pt-4">
              <SummaryLine
                icon={BriefcaseBusiness}
                label="Position"
                value="Driver — Ambulatory"
              />
              <SummaryLine
                icon={CalendarDays}
                label="Experience"
                value="7 years"
              />
              <SummaryLine
                icon={IdCard}
                label="License"
                value="CDL-A · F3847291"
              />
              <SummaryLine
                icon={CalendarDays}
                label="Application date"
                value="Dec 28, 2024"
              />
              <SummaryLine
                icon={CalendarDays}
                label="Available start"
                value="Jan 15, 2025"
              />
            </dl>
            <div className="mt-5">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Docs uploaded</span>
                <strong>6 / 7</strong>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted">
                <div className="h-full w-[85%] rounded-full bg-secondary" />
              </div>
            </div>
          </section>
          <section className={sideCardClass}>
            <h2 className="text-sm font-bold text-foreground">
              Application timeline
            </h2>
            <ol className="mt-5 space-y-4">
              <TimelineStep
                done
                label="Application submitted"
                time="Dec 28, 2024"
              />
              <TimelineStep
                done
                label="Documents uploaded"
                time="Dec 28, 2024"
              />
              <TimelineStep done label="Admin viewed" time="Dec 29, 2024" />
              <TimelineStep
                done
                label="Background verification"
                time="Jan 2, 2025"
              />
              <TimelineStep
                current
                label="Interview scheduled"
                time="Jan 5, 2025"
              />
              <TimelineStep label="Approved / rejected" time="Pending" />
            </ol>
          </section>
          <section className={sideCardClass}>
            <h2 className="text-sm font-bold text-foreground">Documents</h2>
            <label className="mt-4 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-red-200 bg-red-50/35 p-5 text-center">
              <Upload className="size-6 text-red-300" />
              <span className="mt-2 text-xs font-semibold text-muted-foreground">
                Drop files here or{" "}
                <strong className="text-brand-yellow-hover">browse</strong>
              </span>
              <span className="mt-1 text-[9px] text-brand-placeholder">
                PNG, PDF up to 10MB
              </span>
              <input className="sr-only" type="file" />
            </label>
            <button
              className="mt-3 h-9 rounded-lg bg-secondary px-4 text-xs font-bold text-secondary-foreground"
              type="button"
            >
              Preview documents
            </button>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 shadow-[0_-8px_24px_rgba(8,37,82,0.08)] backdrop-blur-md lg:left-62">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              className="flex h-9 items-center gap-2 rounded-lg bg-secondary px-4 text-xs font-bold text-secondary-foreground disabled:opacity-50"
              disabled={decision === "Approved"}
              onClick={() => setDecision("Approved")}
              type="button"
            >
              <CheckCircle2 className="size-4" />
              Approve application
            </button>
            <button
              className="flex h-9 items-center gap-2 rounded-lg border border-red-300 px-4 text-xs font-bold text-red-500 disabled:opacity-50"
              disabled={decision === "Rejected"}
              onClick={() => setDecision("Rejected")}
              type="button"
            >
              <X className="size-4" />
              Reject
            </button>
          </div>
          <button
            className="hidden h-9 items-center gap-2 rounded-lg border border-border px-4 text-xs font-bold text-muted-foreground sm:flex"
            type="button"
          >
            <Archive className="size-4" />
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}

const sideCardClass =
  "rounded-xl border border-[#e1e6ee] bg-card p-5 shadow-[0_4px_14px_rgba(15,37,74,.04)]";

function ReviewSection({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  icon: typeof CircleUserRound;
  title: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="overflow-hidden rounded-xl border border-[#e1e6ee] bg-card shadow-[0_4px_14px_rgba(15,37,74,.04)]">
      <button
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="grid size-8 place-items-center rounded-full bg-amber-50 text-brand-yellow-hover">
          <Icon className="size-4" />
        </span>
        <span className="text-sm font-bold text-foreground">{title}</span>
        <ChevronDown
          className={`ml-auto size-4 text-brand-icon transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="border-t border-border px-5 py-5">{children}</div>
      ) : null}
    </section>
  );
}

function InfoGrid({ items }: { items: string[][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[10px] font-bold uppercase tracking-[0.07em] text-brand-placeholder">
            {label}
          </dt>
          <dd className="mt-1 text-[13px] font-semibold text-foreground">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
function InsetCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <article className="rounded-xl bg-muted/60 p-4">
      <h3 className="mb-4 text-xs font-bold text-foreground">{title}</h3>
      {children}
    </article>
  );
}
function HistoryCard({
  company,
  dates,
  position,
  reason,
  salary,
}: {
  company: string;
  dates: string;
  position: string;
  reason: string;
  salary: string;
}) {
  return (
    <article className="rounded-xl bg-muted/60 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-bold text-foreground">{company}</h3>
          <p className="text-[10px] text-muted-foreground">{position}</p>
        </div>
        <span className="rounded-full bg-card px-2 py-1 text-[9px] text-muted-foreground">
          {dates}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <p className="text-[10px] text-muted-foreground">
          Salary
          <br />
          <strong className="text-xs text-foreground">{salary}</strong>
        </p>
        <p className="text-[10px] text-muted-foreground">
          Reason for leaving
          <br />
          <strong className="text-xs text-foreground">{reason}</strong>
        </p>
      </div>
    </article>
  );
}
function Reference({
  initials,
  name,
  phone,
  position,
}: {
  initials: string;
  name: string;
  phone: string;
  position: string;
}) {
  return (
    <article className="flex gap-3 rounded-xl bg-muted/60 p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
        {initials}
      </span>
      <div>
        <p className="text-xs font-bold text-foreground">{name}</p>
        <p className="text-[9px] text-muted-foreground">{position}</p>
        <p className="mt-2 flex items-center gap-1 text-[10px] text-brand-label">
          <Phone className="size-3" />
          {phone}
        </p>
      </div>
    </article>
  );
}
function DocumentCard({
  name,
  status,
}: {
  name: string;
  status: "Verified" | "Pending" | "Missing";
}) {
  const tone =
    status === "Verified"
      ? "border-emerald-200 bg-emerald-50/65 text-emerald-700"
      : status === "Missing"
        ? "border-red-200 bg-red-50/65 text-red-600"
        : "border-amber-200 bg-amber-50/65 text-amber-700";
  return (
    <article
      className={`flex items-center gap-3 rounded-xl border p-3 ${tone}`}
    >
      <span className="grid size-9 place-items-center rounded-full bg-card">
        <FileText className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-foreground">{name}</p>
        <p className="mt-0.5 text-[9px] font-bold">{status}</p>
      </div>
      <button
        aria-label={`View ${name}`}
        className="grid size-7 place-items-center rounded-full bg-card/80"
        type="button"
      >
        <Eye className="size-3" />
      </button>
      <button
        aria-label={`Download ${name}`}
        className="grid size-7 place-items-center rounded-full bg-card/80"
        type="button"
      >
        <Download className="size-3" />
      </button>
    </article>
  );
}
function DecisionBadge({ decision }: { decision: Decision }) {
  const tone =
    decision === "Approved"
      ? "bg-emerald-50 text-emerald-700"
      : decision === "Rejected"
        ? "bg-red-50 text-red-600"
        : "bg-amber-50 text-amber-700";
  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${tone}`}>
      {decision}
    </span>
  );
}
function SummaryLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <Icon className="size-3.5 text-brand-icon" />
      <span className="text-muted-foreground">{label}</span>
      <strong className="ml-auto text-right text-foreground">{value}</strong>
    </div>
  );
}
function TimelineStep({
  current = false,
  done = false,
  label,
  time,
}: {
  current?: boolean;
  done?: boolean;
  label: string;
  time: string;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${done ? "border-emerald-500 bg-emerald-500 text-white" : current ? "border-secondary bg-amber-50 text-brand-yellow-hover" : "border-border bg-muted"}`}
      >
        {done ? <Check className="size-3" /> : null}
      </span>
      <div>
        <p
          className={`text-[10px] font-bold ${done || current ? "text-foreground" : "text-brand-soft"}`}
        >
          {label}
        </p>
        <p className="mt-0.5 text-[9px] text-brand-placeholder">{time}</p>
      </div>
    </li>
  );
}
