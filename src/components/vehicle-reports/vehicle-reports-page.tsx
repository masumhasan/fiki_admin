"use client";

import {
  CalendarDays,
  CarFront,
  Clock3,
  Eye,
  Gauge,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { getVehicleReportsApi } from "@/lib/api";

type ReportStatus = "Completed" | "In progress" | "Missing report";

type Report = {
  id: string;
  driver: string;
  initials: string;
  avatar: string;
  avatarUrl?: string;
  vehicle: string;
  plate: string;
  date: string;
  shift: string;
  distance: string;
  status: ReportStatus;
};

export function VehicleReportsPage({ hideHeader }: { hideHeader?: boolean } = {}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ReportStatus>("All");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getVehicleReportsApi(token)
      .then((res) => {
        if (res.success && res.data && Array.isArray(res.data)) {
          const mapped: Report[] = res.data.map((r: any) => {
            const driverName = r.driverName || r.inspectorName || "Driver";
            const nameParts = driverName.split(" ").filter(Boolean);
            const initials =
              nameParts.length >= 2
                ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                : driverName.substring(0, 2).toUpperCase();

            return {
              id: r.shiftId || `VR-S-${(r._id || r.id || "").substring(0, 4).toUpperCase()}`,
              rawId: r.id || r._id,
              driver: driverName,
              initials,
              avatar: "bg-primary",
              avatarUrl: r.driverAvatarUrl || r.avatarUrl || "",
              vehicle: r.vehicleName || [r.make, r.vehicleModel].filter(Boolean).join(" ") || "—",
              plate: r.vehicleNumber || r.licensePlate || "—",
              date: r.shiftDateText || (r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" }) : "—"),
              shift: r.shiftTimeText || r.shift || "—",
              distance: r.estimatedMiles != null ? `${r.estimatedMiles} mi` : (r.fuelLevelPercentage != null ? `${r.fuelLevelPercentage}% fuel` : "—"),
              status:
                r.status === "Completed" || r.inspectionStatus === "PASS"
                  ? "Completed"
                  : r.status === "In progress" || r.inspectionStatus === "IN_PROGRESS"
                    ? "In progress"
                    : "Missing report",
            };
          });
          setReports(mapped);
        } else {
          setReports([]);
        }
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      reports.filter(
        (report) =>
          (statusFilter === "All" || report.status === statusFilter) &&
          [report.driver, report.vehicle, report.plate, report.id].some((value) =>
            value.toLowerCase().includes(query.toLowerCase()),
          ),
      ),
    [reports, query, statusFilter],
  );

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <PageHeader
          title="Shift reports"
          description="Review driver-submitted shift and vehicle inspection reports."
        />
      )}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Summary
          label="Total reports"
          value={loading ? null : reports.length}
          tone="text-primary"
        />
        <Summary
          label="Completed"
          tone="text-emerald-500"
          value={loading ? null : reports.filter((r) => r.status === "Completed").length}
        />
        <Summary
          label="In progress"
          tone="text-blue-500"
          value={loading ? null : reports.filter((r) => r.status === "In progress").length}
        />
        <Summary
          label="Needs attention"
          tone="text-red-500"
          value={loading ? null : reports.filter((r) => r.status === "Missing report").length}
        />
      </section>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-icon" />
          <input
            className="h-11 w-full rounded-lg border border-input bg-muted pl-11 pr-4 text-sm outline-none placeholder:text-brand-placeholder focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search driver, vehicle or report ID..."
            value={query}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto sm:justify-end">
          {(["All", "Completed", "In progress", "Missing report"] as const).map((item) => (
            <button
              className={`h-9 whitespace-nowrap rounded-lg px-3 text-xs font-bold ${statusFilter === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              key={item}
              onClick={() => setStatusFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-[0_6px_22px_rgba(8,37,82,0.06)] animate-pulse space-y-4">
              <div className="flex items-start justify-between">
                <div className="size-14 rounded-full bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-36 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-8 rounded bg-muted/60" />
                <div className="h-8 rounded bg-muted/60" />
                <div className="h-8 rounded bg-muted/60" />
                <div className="h-8 rounded bg-muted/60" />
              </div>
            </div>
          ))}
        </section>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-center">
          <CarFront className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-muted-foreground">
            {reports.length === 0
              ? "No shift reports submitted yet"
              : "No reports match your search"}
          </p>
          {reports.length === 0 && (
            <p className="text-xs text-muted-foreground/70">
              Driver-submitted shift and inspection reports will appear here.
            </p>
          )}
        </div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </section>
      )}
    </div>
  );
}

function Summary({
  label,
  tone = "text-primary",
  value,
}: {
  label: string;
  tone?: string;
  value: number | null;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)]">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${tone}`}>
        {value === null ? (
          <span className="inline-block h-8 w-7 animate-pulse rounded bg-muted" />
        ) : (
          value
        )}
      </p>
    </article>
  );
}

function ReportCard({ report }: { report: Report }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)] sm:p-6">
      <div className="flex items-start justify-between">
        {report.avatarUrl ? (
          <img src={report.avatarUrl} alt={report.driver} className="size-14 rounded-full object-cover shrink-0 border border-border" />
        ) : (
          <span
            className={`grid size-14 place-items-center rounded-full text-lg font-bold text-white ${report.avatar}`}
          >
            {report.initials}
          </span>
        )}
        <div className="flex items-center gap-2">
          <Status status={report.status} />
        </div>
      </div>
      <h2 className="mt-5 text-lg font-bold text-foreground">{report.driver}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{report.id}</p>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
        <Info icon={CarFront} label="Vehicle" value={report.vehicle} />
        <Info icon={Gauge} label="Plate" value={report.plate} />
        <Info icon={CalendarDays} label="Report date" value={report.date} />
        <Info icon={Clock3} label="Shift" value={report.shift} />
      </dl>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">
          Distance{" "}
          <strong className="ml-1 text-foreground">{report.distance}</strong>
        </span>
        <Link
          className="flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-xs font-bold text-primary hover:bg-muted"
          href={`/vehicle-reports/${(report as any).rawId || report.id}`}
        >
          <Eye className="size-4" />
          View report
        </Link>
      </div>
    </article>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CarFront;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-1.5 truncate font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function Status({ status }: { status: ReportStatus }) {
  const tone =
    status === "Completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "In progress"
        ? "bg-blue-50 text-blue-600"
        : "bg-red-50 text-red-600";
  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${tone}`}>{status}</span>
  );
}
