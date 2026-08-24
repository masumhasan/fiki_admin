"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  Download,
  Star,
  TicketCheck,
  UserRoundCheck,
  UsersRound,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { getAdminAnalyticsApi } from "@/lib/api";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<{
    metrics?: {
      totalTrips: number;
      completedTrips: number;
      pendingTrips: number;
      cancelledTrips: number;
      rejectedTrips: number;
      totalRevenue: number;
      outstandingPayments: number;
      activeDrivers: number;
      onTripDrivers: number;
      totalDrivers: number;
      totalPassengers: number;
      newPassengersThisWeek: number;
    };
    revenueSummary?: {
      todayRevenue: number;
      weeklyRevenue: number;
      monthlyRevenue: number;
      yearlyRevenue: number;
      outstandingBalance: number;
      avgRidePrice: number;
    };
    monthlyRidePerformance?: Array<{ month: string; requested: number; completed: number }>;
    revenueOverview?: Array<{ month: string; monthlyRevenue: number; outstanding: number }>;
    topDrivers?: Array<{ id: string; initials: string; name: string; trips: number; rating: string; revenue: string; status: string }>;
    recentRideRequests?: Array<{ id: string; rawId?: string; passenger: string; destination: string; status: string; price: string }>;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      if (token) {
        setLoading(true);
        getAdminAnalyticsApi(token)
          .then((res) => {
            if (res.success && res.data) {
              setAnalyticsData(res.data);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }
  }, []);

  const m = analyticsData?.metrics;
  const rev = analyticsData?.revenueSummary;

  const totalTripsVal = m?.totalTrips ?? 0;
  const completedTripsVal = m?.completedTrips ?? 0;
  const pendingTripsVal = m?.pendingTrips ?? (m as any)?.pendingRequests ?? 0;
  const cancelledTripsVal = m?.cancelledTrips ?? 0;
  const rejectedTripsVal = m?.rejectedTrips ?? 0;

  const completionRate = totalTripsVal > 0 ? ((completedTripsVal / totalTripsVal) * 100).toFixed(1) : "0.0";
  const cancellationRate = totalTripsVal > 0 ? ((cancelledTripsVal / totalTripsVal) * 100).toFixed(1) : "0.0";
  const pendingRate = totalTripsVal > 0 ? ((pendingTripsVal / totalTripsVal) * 100).toFixed(1) : "0.0";
  const rejectedRate = totalTripsVal > 0 ? ((rejectedTripsVal / totalTripsVal) * 100).toFixed(1) : "0.0";

  const totalRevenueVal = m?.totalRevenue ?? 0;
  const outstandingVal = m?.outstandingPayments ?? 0;
  const outstandingPct = totalRevenueVal > 0 ? ((outstandingVal / totalRevenueVal) * 100).toFixed(1) : "0.0";

  const activeDriversVal = m?.activeDrivers ?? 0;
  const onTripDriversVal = m?.onTripDrivers ?? 0;
  const totalPassengersVal = m?.totalPassengers ?? 0;
  const newPassengersVal = m?.newPassengersThisWeek ?? 0;

  const dynamicMetrics = [
    [
      "Total ride requests",
      totalTripsVal.toLocaleString(),
      "+12% from last month",
      TicketCheck,
      "bg-blue-50 text-blue-600",
      true,
    ],
    [
      "Completed rides",
      completedTripsVal.toLocaleString(),
      `${completionRate}% completion rate`,
      UserRoundCheck,
      "bg-emerald-50 text-emerald-600",
      true,
    ],
    [
      "Pending rides",
      pendingTripsVal.toLocaleString(),
      "Waiting for approval",
      Clock3,
      "bg-amber-50 text-amber-600",
      null,
    ],
    [
      "Cancelled rides",
      cancelledTripsVal.toLocaleString(),
      `${cancellationRate}% cancellation rate`,
      XCircle,
      "bg-red-50 text-red-500",
      false,
    ],
    [
      "Total revenue",
      `$${totalRevenueVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      "+8.3% from last month",
      CircleDollarSign,
      "bg-emerald-50 text-emerald-600",
      true,
    ],
    [
      "Outstanding payments",
      `$${outstandingVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${outstandingPct}% of total revenue`,
      CircleDollarSign,
      "bg-amber-50 text-amber-600",
      null,
    ],
    [
      "Active drivers",
      String(activeDriversVal),
      `${onTripDriversVal} currently on a trip`,
      UserRoundCheck,
      "bg-blue-50 text-blue-600",
      null,
    ],
    [
      "Total passengers",
      totalPassengersVal.toLocaleString(),
      `+${newPassengersVal} new this week`,
      UsersRound,
      "bg-violet-50 text-violet-600",
      true,
    ],
  ] as const;

  // Monthly performance chart bars calculation
  const liveMonthlyPerf = analyticsData?.monthlyRidePerformance || [];
  const maxPerfVal = Math.max(1, ...liveMonthlyPerf.map((i) => Math.max(i.requested, i.completed)));
  const monthlyBars = liveMonthlyPerf.length > 0
    ? liveMonthlyPerf.map((i) => [
        i.month,
        Math.min(100, Math.max(0, Math.round((i.requested / maxPerfVal) * 100))),
        Math.min(100, Math.max(0, Math.round((i.completed / maxPerfVal) * 100))),
      ] as const)
    : monthNames.map((m) => [m, 0, 0] as const);

  // Driver Table Data
  const topDriversData = (analyticsData?.topDrivers || []).map(
    (d) => [d.initials, d.name, String(d.trips), d.rating, d.revenue, d.status] as const,
  );

  // Ride Table Data
  const recentRidesData = (analyticsData?.recentRideRequests || []).map((r: any) => {
    if (Array.isArray(r)) {
      const rideId = r[6] || r[0];
      const passenger = r[1];
      const dest = r[2];
      const status = r[3];
      const price = r[4];
      return [rideId, passenger, dest, status, price] as const;
    }
    return [r.id || "FT-0", r.passenger || "Passenger", r.destination || "Destination", r.status || "Pending", r.price || "$0.00"] as const;
  });


  function exportReport() {
    const csv = [
      "Metric,Value",
      ...dynamicMetrics.map(([label, value]) => `"${label}","${value}"`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "fiki-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="Analytics"
        description="A complete view of ride, revenue and fleet performance."
        action={
          <button
            className="hidden h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-bold shadow-sm sm:flex"
            onClick={exportReport}
            type="button"
          >
            <Download className="size-4" /> Export report
          </button>
        }
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {dynamicMetrics.map(([label, value, note, Icon, tone, direction]) => (
          <article className={cardClass} key={label}>
            <div className="flex items-start justify-between">
              <span
                className={`grid size-10 place-items-center rounded-xl ${tone}`}
              >
                <Icon className="size-5" />
              </span>
              {direction !== null &&
                (direction ? (
                  <ArrowUpRight className="size-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="size-4 text-red-500" />
                ))}
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-[-0.04em] text-foreground">
              {value}
            </p>
            <p className="mt-1 text-[10px] text-brand-soft">{note}</p>
          </article>
        ))}
      </section>

      <section className={cardClass}>
        <CardHeading
          title="Monthly ride performance"
          subtitle="Ride requests vs. completed rides · Jan – Dec 2026"
        />
        <div className="mt-2 flex justify-end gap-4 text-[10px] text-muted-foreground">
          <LegendDot color="bg-blue-600" label="Ride requests" />
          <LegendDot color="bg-emerald-500" label="Completed rides" />
        </div>
        <div className="mt-5 flex h-58 items-end gap-2 border-b border-dashed border-border px-1 sm:gap-4">
          {monthlyBars.map(([month, request, completed]) => (
            <div
              className="flex h-full min-w-0 flex-1 flex-col justify-end"
              key={month}
            >
              <div className="flex h-[calc(100%-24px)] items-end justify-center gap-0.5 sm:gap-1">
                <i
                  className="w-2.5 rounded-t bg-blue-600 sm:w-3.5"
                  style={{ height: `${request}%` }}
                />
                <i
                  className="w-2.5 rounded-t bg-emerald-500 sm:w-3.5"
                  style={{ height: `${completed}%` }}
                />
              </div>
              <span className="mt-2 text-center text-[9px] text-muted-foreground">
                {month}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <article className={cardClass}>
          <CardHeading
            title="Revenue overview"
            subtitle="Monthly revenue vs. outstanding payments"
          />
          <div className="mt-4 flex gap-4">
            <LegendDot color="bg-blue-600" label="Monthly revenue" />
            <LegendDot color="bg-orange-500" label="Outstanding" />
          </div>
          <RevenueChart data={analyticsData?.revenueOverview} />
        </article>
        <article className={cardClass}>
          <CardHeading
            title="Ride status distribution"
            subtitle="Breakdown for current period"
          />
          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-center xl:flex-col">
            <div
              className="grid size-38 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#22c55e 0 ${completionRate}%, #f97316 ${completionRate}% ${Number(completionRate) + Number(pendingRate)}%, #ef4444 ${Number(completionRate) + Number(pendingRate)}% ${Number(completionRate) + Number(pendingRate) + Number(cancellationRate)}%, #94a3b8 ${Number(completionRate) + Number(pendingRate) + Number(cancellationRate)}% 100%)`,
              }}
            >
              <div className="size-23 rounded-full bg-card" />
            </div>
            <div className="grid w-full grid-cols-2 gap-3">
              <StatusStat
                color="bg-emerald-500"
                label="Completed"
                value={completedTripsVal.toLocaleString()}
              />
              <StatusStat
                color="bg-orange-500"
                label="Pending"
                value={pendingTripsVal.toLocaleString()}
              />
              <StatusStat
                color="bg-red-500"
                label="Cancelled"
                value={cancelledTripsVal.toLocaleString()}
              />
              <StatusStat
                color="bg-slate-400"
                label="Rejected"
                value={rejectedTripsVal.toLocaleString()}
              />
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <DataCard title="Top drivers">
          <DriverTable data={topDriversData} />
        </DataCard>
        <DataCard title="Recent ride requests">
          <RideTable data={recentRidesData} />
        </DataCard>
      </section>

      <section className={cardClass}>
        <CardHeading
          title="Ride performance"
          subtitle="Rate breakdown across all ride statuses this period"
        />
        <div className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
          <Progress
            label="Completed rate"
            value={`${completionRate}%`}
            width={`${completionRate}%`}
            color="bg-emerald-500"
          />
          <Progress
            label="Pending rate"
            value={`${pendingRate}%`}
            width={`${pendingRate}%`}
            color="bg-orange-500"
          />
          <Progress
            label="Cancelled rate"
            value={`${cancellationRate}%`}
            width={`${cancellationRate}%`}
            color="bg-red-500"
          />
          <Progress
            label="Rejected rate"
            value={`${rejectedRate}%`}
            width={`${rejectedRate}%`}
            color="bg-slate-400"
          />
        </div>
      </section>

      <section className={cardClass}>
        <CardHeading
          title="Revenue summary"
          subtitle="Aggregated financial metrics across all time periods"
        />
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            ["Today's revenue", rev ? `$${rev.todayRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00", "text-emerald-600"],
            ["Weekly revenue", rev ? `$${rev.weeklyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00", "text-blue-600"],
            ["Monthly revenue", rev ? `$${rev.monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00", "text-blue-600"],
            ["Yearly revenue", rev ? `$${rev.yearlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00", "text-blue-600"],
            ["Outstanding balance", rev ? `$${rev.outstandingBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00", "text-orange-500"],
            ["Avg ride price", rev ? `$${rev.avgRidePrice.toFixed(2)}` : "$0.00", "text-foreground"],
          ].map(([label, value, color]) => (
            <div
              className="rounded-xl border border-border bg-muted/25 p-4"
              key={label}
            >
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className={`mt-1 text-lg font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="size-10 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="size-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-7 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="space-y-2">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="flex h-56 items-end gap-3 border-b border-dashed border-border pt-6 pb-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2 h-full">
              <div className="w-full flex justify-center gap-1 items-end h-full">
                <div
                  className="w-3 rounded-t animate-pulse bg-slate-200 dark:bg-slate-800"
                  style={{ height: `${30 + (i % 5) * 12}%` }}
                />
                <div
                  className="w-3 rounded-t animate-pulse bg-slate-300 dark:bg-slate-700"
                  style={{ height: `${25 + (i % 4) * 15}%` }}
                />
              </div>
              <div className="h-3 w-6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div className="space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-48 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div className="space-y-2">
            <div className="h-5 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="size-36 animate-pulse rounded-full border-8 border-slate-200 dark:border-slate-800" />
            <div className="grid w-full grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm p-5 space-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800/50" />
          ))}
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm p-5 space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800/50" />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="h-5 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-10 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-2 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" />
          ))}
        </div>
      </div>
    </div>
  );
}

const cardClass =
  "rounded-xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)] sm:p-6";
function CardHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p>
    </div>
  );
}
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
      <i className={`size-2.5 rounded-sm ${color}`} />
      {label}
    </span>
  );
}
function StatusStat({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2">
      <i className={`mt-1 size-2 rounded-full ${color}`} />
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <strong className="text-xs">{value}</strong>
      </div>
    </div>
  );
}
function DataCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_6px_22px_rgba(8,37,82,0.06)]">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-sm font-bold">{title}</h2>
        <button className="text-[10px] font-bold text-blue-600" type="button">
          View all →
        </button>
      </div>
      {children}
    </article>
  );
}

function DriverTable({ data }: { data: ReadonlyArray<readonly [string, string, string, string, string, string]> }) {
  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground">
        No drivers found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-130 text-left text-[11px]">
        <thead className="bg-muted/55 text-[9px] uppercase text-muted-foreground">
          <tr>
            <th className="px-5 py-3">Driver</th>
            <th>Trips</th>
            <th>Rating</th>
            <th>Revenue</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(([initials, name, trips, rating, revenue, status], idx) => (
            <tr className="border-t border-border" key={`${name}-${idx}`}>
              <td className="px-5 py-3">
                <span className="flex items-center gap-2 font-semibold">
                  <i className="grid size-7 place-items-center rounded-full bg-blue-600 text-[9px] not-italic text-white">
                    {initials}
                  </i>
                  {name}
                </span>
              </td>
              <td className="font-semibold">{trips}</td>
              <td>
                <span className="flex items-center gap-1">
                  <Star className="size-3 fill-secondary text-secondary" />
                  {rating}
                </span>
              </td>
              <td className="font-semibold text-emerald-600">{revenue}</td>
              <td>
                <Badge status={status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function RideTable({ data }: { data: ReadonlyArray<readonly [string, string, string, string, string]> }) {
  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground">
        No recent ride requests found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-135 text-left text-[11px]">
        <thead className="bg-muted/55 text-[9px] uppercase text-muted-foreground">
          <tr>
            <th className="px-5 py-3">Ride ID</th>
            <th>Passenger</th>
            <th>Destination</th>
            <th>Status</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map(([id, passenger, destination, status, price], idx) => (
            <tr className="border-t border-border" key={`${id}-${idx}`}>
              <td className="px-5 py-3 font-bold text-blue-600">{id}</td>
              <td className="font-semibold">{passenger}</td>
              <td className="max-w-35 truncate text-muted-foreground">
                {destination}
              </td>
              <td>
                <Badge status={status} />
              </td>
              <td className="font-bold">{price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const tone =
    status === "Completed" || status === "Active"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Cancelled"
        ? "bg-red-50 text-red-600"
        : status === "Pending"
          ? "bg-amber-50 text-amber-700"
          : status === "Off Duty"
            ? "bg-slate-100 text-slate-500"
            : "bg-blue-50 text-blue-600";
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-bold ${tone}`}
    >
      {status}
    </span>
  );
}
function Progress({
  label,
  value,
  width,
  color,
}: {
  label: string;
  value: string;
  width: string;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-semibold">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}

function RevenueChart({ data }: { data?: Array<{ month: string; monthlyRevenue: number; outstanding: number }> }) {
  let pathD1 = "M25 185 L680 185";
  let pathD2 = "M25 185 L680 185";

  if (data && data.length > 0) {
    const maxVal = Math.max(1, ...data.map((d) => Math.max(d.monthlyRevenue, d.outstanding)));
    const startX = 25;
    const width = 655;
    const height = 150;
    const points1 = data.map((d, i) => {
      const x = startX + (i / (data.length - 1)) * width;
      const y = 185 - (d.monthlyRevenue / maxVal) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const points2 = data.map((d, i) => {
      const x = startX + (i / (data.length - 1)) * width;
      const y = 185 - (d.outstanding / maxVal) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    pathD1 = `M ${points1.join(" L ")}`;
    pathD2 = `M ${points2.join(" L ")}`;
  }

  return (
    <svg
      aria-label="Revenue trend chart"
      className="mt-5 h-50 w-full"
      role="img"
      viewBox="0 0 700 220"
    >
      <g stroke="currentColor" className="text-border" strokeDasharray="4 5">
        <path d="M25 30H680" />
        <path d="M25 85H680" />
        <path d="M25 140H680" />
        <path d="M25 195H680" />
      </g>
      <path
        d={pathD1}
        fill="none"
        stroke="#2563eb"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={pathD2}
        fill="none"
        stroke="#f97316"
        strokeDasharray="6 5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
