"use client";

import {
  CalendarDays,
  CarFront,
  Clock3,
  Eye,
  Gauge,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";

type ReportStatus = "Completed" | "In progress" | "Missing report";

const reports = [
  {
    id: "VR-2026-0803-01",
    driver: "Marcus Williams",
    initials: "MW",
    avatar: "bg-primary",
    vehicle: "Toyota Sienna",
    plate: "FKT-1234",
    date: "Aug 3, 2026",
    shift: "7:00 AM – 3:00 PM",
    distance: "318 km",
    status: "Completed" as ReportStatus,
  },
  {
    id: "VR-2026-0803-02",
    driver: "Aisha Patel",
    initials: "AP",
    avatar: "bg-violet-600",
    vehicle: "Honda Odyssey",
    plate: "FKT-2345",
    date: "Aug 3, 2026",
    shift: "7:00 AM – 3:00 PM",
    distance: "286 km",
    status: "Completed" as ReportStatus,
  },
  {
    id: "VR-2026-0803-03",
    driver: "Robert Thompson",
    initials: "RT",
    avatar: "bg-blue-600",
    vehicle: "Ford Transit",
    plate: "FKT-3456",
    date: "Aug 3, 2026",
    shift: "3:00 PM – 11:00 PM",
    distance: "164 km",
    status: "In progress" as ReportStatus,
  },
  {
    id: "VR-2026-0802-04",
    driver: "Linda Chen",
    initials: "LC",
    avatar: "bg-red-500",
    vehicle: "Dodge Grand Caravan",
    plate: "FKT-4567",
    date: "Aug 2, 2026",
    shift: "7:00 AM – 3:00 PM",
    distance: "301 km",
    status: "Completed" as ReportStatus,
  },
  {
    id: "VR-2026-0802-05",
    driver: "James Morrison",
    initials: "JM",
    avatar: "bg-cyan-600",
    vehicle: "Toyota Highlander",
    plate: "FKT-5678",
    date: "Aug 2, 2026",
    shift: "11:00 PM – 7:00 AM",
    distance: "—",
    status: "Missing report" as ReportStatus,
  },
];

export function VehicleReportsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | ReportStatus>("All");
  const filtered = useMemo(
    () =>
      reports.filter(
        (report) =>
          (status === "All" || report.status === status) &&
          [report.driver, report.vehicle, report.plate, report.id].some(
            (value) => value.toLowerCase().includes(query.toLowerCase()),
          ),
      ),
    [query, status],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle reports"
        description="Review driver-submitted shift and vehicle inspection reports."
      />
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Summary label="Total reports" value={reports.length} />
        <Summary
          label="Completed"
          tone="text-emerald-500"
          value={reports.filter((item) => item.status === "Completed").length}
        />
        <Summary
          label="In progress"
          tone="text-blue-500"
          value={reports.filter((item) => item.status === "In progress").length}
        />
        <Summary
          label="Needs attention"
          tone="text-red-500"
          value={
            reports.filter((item) => item.status === "Missing report").length
          }
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
          {(["All", "Completed", "In progress", "Missing report"] as const).map(
            (item) => (
              <button
                className={`h-9 whitespace-nowrap rounded-lg px-3 text-xs font-bold ${status === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                key={item}
                onClick={() => setStatus(item)}
                type="button"
              >
                {item}
              </button>
            ),
          )}
        </div>
      </section>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </section>
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
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)]">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
    </article>
  );
}

function ReportCard({ report }: { report: (typeof reports)[number] }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)] sm:p-6">
      <div className="flex items-start justify-between">
        <span
          className={`grid size-14 place-items-center rounded-full text-lg font-bold text-white ${report.avatar}`}
        >
          {report.initials}
        </span>
        <div className="flex items-center gap-2">
          <Status status={report.status} />
        </div>
      </div>
      <h2 className="mt-5 text-lg font-bold text-foreground">
        {report.driver}
      </h2>
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
          href={`/vehicle-reports/${report.id}`}
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
    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${tone}`}>
      {status}
    </span>
  );
}
