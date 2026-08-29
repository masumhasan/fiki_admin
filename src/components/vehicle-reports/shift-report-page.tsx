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
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { getShiftReportByIdApi } from "@/lib/api";

type ShiftDetail = {
  id: string;
  shiftId: string;
  driverName: string;
  driverEmail: string;
  driverPhone: string;
  driverCode: string;
  vehicleName: string;
  vehicleNumber: string;
  shiftTimeText: string;
  startTimeStr: string;
  endTimeStr: string;
  shiftDateText: string;
  status: string;
  startingOdometer: number;
  endingOdometer: number | null;
  estimatedMiles: number;
  startFuel: string;
  endFuel: string;
  startCondition: string;
  endCondition: string;
  startNotes: string;
  endNotes: string;
  startPhotoUrl: string;
  endPhotoUrl: string;
  totalHoursText: string;
};

const fuelMap: Record<string, string> = {
  empty: "Empty",
  quarter: "1/4",
  half: "1/2",
  "three-quarters": "3/4",
  full: "Full",
};

const conditionMap: Record<string, string> = {
  clear: "Good",
  maintenance: "Minor issue",
  damage: "Needs repair",
  cleaned: "Cleaned",
};

export function ShiftReportPage({ reportId }: { reportId: string }) {
  const [data, setData] = useState<ShiftDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getShiftReportByIdApi(token, reportId)
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  const initials = data?.driverName
    ? data.driverName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "DR";

  const previewPhotoUrl =
    preview === "start" ? data?.startPhotoUrl : preview === "end" ? data?.endPhotoUrl : null;

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

      {loading ? (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)] animate-pulse sm:p-7 space-y-6">
          <div className="grid items-center gap-5 lg:grid-cols-[minmax(270px,1fr)_2fr]">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-muted" />
                <div className="h-3 w-28 rounded bg-muted" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="h-10 rounded bg-muted/60" />
              <div className="h-10 rounded bg-muted/60" />
              <div className="h-10 rounded bg-muted/60" />
              <div className="h-10 rounded bg-muted/60" />
            </div>
          </div>
        </section>
      ) : data ? (
        <>
          <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)] sm:p-7">
            <div className="grid items-center gap-5 lg:grid-cols-[minmax(270px,1fr)_2fr]">
              <div className="flex items-center gap-4">
                <span className="relative grid size-16 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground ring-4 ring-secondary">
                  <span>{initials}</span>
                  <i
                    className={`absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-card ${
                      data.status === "Completed" ? "bg-emerald-500" : "bg-blue-500"
                    }`}
                  />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{data.driverName}</h2>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        data.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <Check className="size-3" />
                      {data.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Driver ID: {data.driverCode} · {data.shiftId}
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4 border-border lg:grid-cols-4 lg:border-l lg:pl-6">
                <HeaderInfo label="Vehicle name" value={data.vehicleName} />
                <HeaderInfo label="Vehicle number" value={data.vehicleNumber} />
                <HeaderInfo label="Shift" value={data.shiftTimeText} />
                <HeaderInfo label="Shift date" value={data.shiftDateText} />
              </dl>
            </div>
          </section>

          <section className="grid items-start gap-5 xl:grid-cols-2">
            <InspectionCard kind="start" data={data} onPreview={() => setPreview("start")} />
            <InspectionCard kind="end" data={data} onPreview={() => setPreview("end")} />
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)] sm:p-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-500">
                <BarChart3 className="size-4" />
              </span>
              <h2 className="font-bold text-foreground">Shift summary</h2>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <Metric icon={Clock3} label="Shift start time" value={data.startTimeStr} />
              <Metric icon={MapPin} label="Shift end time" value={data.endTimeStr} />
              <Metric icon={Timer} label="Total working hours" value={data.totalHoursText} />
              <Metric icon={Gauge} label="Starting mileage" value={`${data.startingOdometer.toLocaleString()} mi`} />
              <Metric
                icon={Gauge}
                label="Ending mileage"
                value={data.endingOdometer ? `${data.endingOdometer.toLocaleString()} mi` : "—"}
              />
              <Metric icon={BarChart3} label="Total distance" value={`${data.estimatedMiles} mi`} />
            </div>
          </section>
        </>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-center">
          <p className="text-sm font-semibold text-muted-foreground">Shift report not found</p>
        </div>
      )}

      {preview && data ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-primary/70 p-5 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`${preview} odometer photo`}
        >
          <button
            aria-label="Close image preview"
            className="absolute inset-0 cursor-default"
            onClick={() => setPreview(null)}
            type="button"
          />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-card p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-foreground">
                {preview === "start" ? "Starting" : "Ending"} Odometer Evidence Photo
              </h3>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="grid size-8 place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-3 flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-950 text-white">
              {previewPhotoUrl ? (
                <img
                  src={previewPhotoUrl}
                  alt={`${preview} odometer evidence`}
                  className="max-h-full w-full object-contain"
                />
              ) : (
                <div className="text-center p-6">
                  <Gauge className="mx-auto size-14 text-secondary" />
                  <p className="mt-4 font-mono text-3xl font-bold">
                    {preview === "start" ? data.startingOdometer : data.endingOdometer || "—"} mi
                  </p>
                  <p className="mt-2 text-xs text-white/60">
                    Odometer reading · {data.shiftDateText}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InspectionCard({
  kind,
  data,
  onPreview,
}: {
  kind: "start" | "end";
  data: ShiftDetail;
  onPreview: () => void;
}) {
  const start = kind === "start";
  const fuelValue = start ? data.startFuel : data.endFuel;
  const rawCondition = start ? data.startCondition : data.endCondition;
  const notes = start ? data.startNotes : data.endNotes;
  const photoUrl = start ? data.startPhotoUrl : data.endPhotoUrl;
  const odoValue = start
    ? `${data.startingOdometer.toLocaleString()} mi`
    : data.endingOdometer
    ? `${data.endingOdometer.toLocaleString()} mi`
    : "—";

  const selectedFuelDisplay = fuelMap[fuelValue] || fuelValue || "1/2";
  const selectedCondDisplay = conditionMap[rawCondition] || rawCondition || "Good";

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)] sm:p-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <span
          className={`grid size-9 place-items-center rounded-xl ${
            start ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
          }`}
        >
          {start ? <Fuel className="size-4" /> : <MapPin className="size-4" />}
        </span>
        <h2 className="font-bold text-foreground">{start ? "Start" : "End"} shift information</h2>
      </div>
      <div
        className={`mt-5 rounded-xl border px-4 py-3 text-xs font-bold ${
          start
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-blue-200 bg-blue-50 text-blue-600"
        }`}
      >
        Shift {start ? `started at ${data.startTimeStr}` : `ended at ${data.endTimeStr}`} —{" "}
        {data.shiftDateText}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-5">
        <Field label="Assigned vehicle" value={`${data.vehicleName} — ${data.vehicleNumber}`} />
        <Field label={`${start ? "Starting" : "Ending"} odometer`} value={odoValue} />
      </dl>
      <div className="mt-5">
        <p className={labelClass}>Fuel level</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Empty", "1/4", "1/2", "3/4", "Full"].map((level) => (
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                level === selectedFuelDisplay
                  ? "border-secondary bg-secondary text-secondary-foreground"
                  : "border-border bg-muted text-muted-foreground"
              }`}
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
          {["Good", "Minor issue", "Needs repair", "Cleaned"].map((condition) => (
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                condition === selectedCondDisplay
                  ? start
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-border bg-muted text-muted-foreground"
              }`}
              key={condition}
            >
              {condition}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <p className={labelClass}>{start ? "Start" : "End"} shift notes</p>
        <p className="mt-2 text-sm leading-6 text-foreground">
          {notes || "No additional notes provided by driver."}
        </p>
      </div>
      <div className="mt-5">
        <p className="mb-2 text-xs text-muted-foreground">
          Odometer photo ({start ? "start" : "end"})
        </p>
        <div
          className={`relative grid aspect-[16/7] place-items-center overflow-hidden rounded-2xl ${
            start
              ? "bg-[radial-gradient(circle_at_center,#334b6b,#0b2347)]"
              : "bg-[linear-gradient(180deg,#eef2f7,#9ca7b8)]"
          }`}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${start ? "Start" : "End"} odometer photo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center text-white">
              <Gauge className="mx-auto size-10 text-secondary" />
              <p className="mt-2 font-mono text-xl font-bold">{odoValue}</p>
            </div>
          )}
          <button
            className="absolute bottom-3 left-3 flex h-9 items-center gap-2 rounded-lg bg-card/90 px-4 text-xs font-bold text-primary shadow backdrop-blur-sm hover:bg-card"
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

const labelClass = "text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground";
function HeaderInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={labelClass}>{label}</dt>
      <dd className="mt-1.5 text-xs font-bold text-foreground sm:text-sm">{value}</dd>
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
