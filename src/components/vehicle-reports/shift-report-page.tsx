"use client";

import {
  ArrowLeft,
  BarChart3,
  Check,
  Clock3,
  Eye,
  Fuel,
  Gauge,
  MapPin,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";

export function ShiftReportPage({ reportId }: { reportId: string }) {
  const [preview, setPreview] = useState<"start" | "end" | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver shift details"
        description="Review the shift information and vehicle inspection submitted by the driver."
        action={
          <Link
            className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold hover:bg-muted"
            href="/vehicle-reports"
          >
            <ArrowLeft className="size-4" /> Back to reports
          </Link>
        }
      />

      <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)] sm:p-7">
        <div className="grid items-center gap-5 lg:grid-cols-[minmax(270px,1fr)_2fr]">
          <div className="flex items-center gap-4">
            <span className="relative grid size-16 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground ring-4 ring-secondary">
              <span>MW</span>
              <i className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-card bg-emerald-500" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  Marcus Williams
                </h2>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  <Check className="size-3" />
                  Completed
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Driver ID: D-001 · {reportId}
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 border-border lg:grid-cols-4 lg:border-l lg:pl-6">
            <HeaderInfo label="Vehicle name" value="Toyota Sienna" />
            <HeaderInfo label="Vehicle number" value="FKT-1234" />
            <HeaderInfo label="Shift" value="7:00 AM – 3:00 PM" />
            <HeaderInfo label="Shift date" value="August 3, 2026" />
          </dl>
        </div>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-2">
        <InspectionCard kind="start" onPreview={() => setPreview("start")} />
        <InspectionCard kind="end" onPreview={() => setPreview("end")} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)] sm:p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-500">
            <BarChart3 className="size-4" />
          </span>
          <h2 className="font-bold text-foreground">Shift summary</h2>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Metric icon={Clock3} label="Shift start time" value="7:02 AM" />
          <Metric icon={MapPin} label="Shift end time" value="3:04 PM" />
          <Metric icon={Timer} label="Total working hours" value="8h 02m" />
          <Metric icon={Gauge} label="Starting mileage" value="48,320 km" />
          <Metric icon={Gauge} label="Ending mileage" value="48,638 km" />
          <Metric icon={BarChart3} label="Total distance" value="318 km" />
        </div>
      </section>

      {preview ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-primary/60 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${preview} odometer photo`}
        >
          <button
            aria-label="Close image preview"
            className="absolute inset-0"
            onClick={() => setPreview(null)}
            type="button"
          />
          <div className="relative z-10 w-full max-w-2xl rounded-xl bg-card p-4 shadow-2xl">
            <div className="grid aspect-video place-items-center rounded-2xl bg-[radial-gradient(circle_at_center,#273b59,#081e40)] text-white">
              <div className="text-center">
                <Gauge className="mx-auto size-16 text-secondary" />
                <p className="mt-4 text-3xl font-mono font-bold">
                  {preview === "start" ? "48,320" : "48,638"} km
                </p>
                <p className="mt-2 text-xs text-white/60">
                  Odometer evidence · August 3, 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InspectionCard({
  kind,
  onPreview,
}: {
  kind: "start" | "end";
  onPreview: () => void;
}) {
  const start = kind === "start";
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)] sm:p-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <span
          className={`grid size-9 place-items-center rounded-xl ${start ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"}`}
        >
          {start ? <Fuel className="size-4" /> : <MapPin className="size-4" />}
        </span>
        <h2 className="font-bold text-foreground">
          {start ? "Start" : "End"} shift information
        </h2>
      </div>
      <div
        className={`mt-5 rounded-xl border px-4 py-3 text-xs font-bold ${start ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-600"}`}
      >
        Shift {start ? "started at 7:02 AM" : "ended at 3:04 PM"} — August 3,
        2026
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-5">
        <Field label="Assigned vehicle" value="Toyota Sienna — FKT-1234" />
        <Field
          label={`${start ? "Starting" : "Ending"} odometer`}
          value={start ? "48,320 km" : "48,638 km"}
        />
      </dl>
      <div className="mt-5">
        <p className={labelClass}>Fuel level</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Empty", "1/4", "1/2", "3/4", "Full"].map((level) => (
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${level === (start ? "3/4" : "1/4") ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-muted text-muted-foreground"}`}
              key={level}
            >
              {level}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <p className={labelClass}>Vehicle condition</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Good", "Minor issue", "Needs repair", "Out of service"].map(
            (condition) => (
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${condition === (start ? "Good" : "Minor issue") ? (start ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-amber-300 bg-amber-50 text-amber-700") : "border-border bg-muted text-muted-foreground"}`}
                key={condition}
              >
                {condition}
              </span>
            ),
          )}
        </div>
      </div>
      <div className="mt-5">
        <p className={labelClass}>{start ? "Start" : "End"} shift notes</p>
        <p className="mt-2 text-sm leading-6 text-foreground">
          {start
            ? "Vehicle checked and ready. All lights functional, tires properly inflated, mirrors adjusted."
            : "Minor rattling sound noted near rear door. Reported to maintenance team. All passengers safely delivered."}
        </p>
      </div>
      <div className="mt-5">
        <p className="mb-2 text-xs text-muted-foreground">
          Odometer photo ({start ? "start" : "end"})
        </p>
        <div
          className={`relative grid aspect-[16/7] place-items-center overflow-hidden rounded-2xl ${start ? "bg-[radial-gradient(circle_at_center,#334b6b,#0b2347)]" : "bg-[linear-gradient(180deg,#eef2f7,#9ca7b8)]"}`}
        >
          <div className="text-center text-white">
            <Gauge className="mx-auto size-10 text-secondary" />
            <p className="mt-2 font-mono text-xl font-bold">
              {start ? "48,320" : "48,638"} km
            </p>
          </div>
          <button
            className="absolute bottom-3 left-3 flex h-9 items-center gap-2 rounded-lg bg-card px-4 text-xs font-bold text-primary shadow"
            onClick={onPreview}
            type="button"
          >
            <Eye className="size-4" />
            View image
          </button>
        </div>
      </div>
    </article>
  );
}

const labelClass =
  "text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground";
function HeaderInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={labelClass}>{label}</dt>
      <dd className="mt-1.5 text-xs font-bold text-foreground sm:text-sm">
        {value}
      </dd>
    </div>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={labelClass}>{label}</dt>
      <dd className="mt-2 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-muted/50 p-4 text-center">
      <span className="mx-auto grid size-9 place-items-center rounded-xl bg-card text-primary">
        <Icon className="size-4" />
      </span>
      <p className="mt-4 text-lg font-bold text-foreground">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
    </article>
  );
}
