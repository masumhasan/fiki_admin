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

const defaultMonths = [
  ["Jan", 56, 55],
  ["Feb", 64, 63],
  ["Mar", 72, 71],
  ["Apr", 61, 60],
  ["May", 80, 79],
  ["Jun", 90, 89],
  ["Jul", 84, 83],
  ["Aug", 74, 74],
  ["Sep", 87, 86],
  ["Oct", 92, 91],
  ["Nov", 82, 81],
  ["Dec", 77, 76],
] as const;

const defaultDrivers = [
  ["MR", "Marcus Rivera", "142", "4.9", "$6,840", "Active"],
  ["AT", "Angela Thompson", "128", "4.8", "$6,120", "Active"],
  ["JO", "James O'Brien", "119", "4.7", "$5,680", "Active"],
  ["PS", "Priya Sharma", "112", "4.9", "$5,340", "Active"],
  ["CM", "Carlos Mendez", "98", "4.6", "$4,720", "On Trip"],
  ["LP", "Linda Park", "87", "4.8", "$4,180", "Off Duty"],
] as const;

const defaultRides = [
  ["FT-4821", "Dorothy Hayes", "Hartford Medical Ctr", "Completed", "$28.50"],
  ["FT-4820", "Robert Kim", "Bridgeport Hospital", "In Progress", "$34.00"],
  ["FT-4819", "Susan Clark", "Stamford Health Clinic", "Pending", "$41.75"],
  [
    "FT-4818",
    "Thomas Wright",
    "Yale New Haven Hospital",
    "Completed",
    "$52.20",
  ],
  ["FT-4817", "Maria Santos", "Norwalk Community Hosp", "Cancelled", "$22.00"],
  ["FT-4816", "George Adams", "Danbury Hospital", "Completed", "$38.90"],
] as const;

export function AnalyticsPage() {
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
        getAdminAnalyticsApi(token).then((res) => {
          if (res.success && res.data) {
            setAnalyticsData(res.data);
          }
        });
      }
    }
  }, []);

  const m = analyticsData?.metrics;
  const rev = analyticsData?.revenueSummary;

  const totalTripsVal = m?.totalTrips ?? 1248;
  const completedTripsVal = m?.completedTrips ?? 1050;
  const pendingTripsVal = m?.pendingTrips ?? (m as any)?.pendingRequests ?? 138;
  const cancelledTripsVal = m?.cancelledTrips ?? 60;
  const rejectedTripsVal = m?.rejectedTrips ?? 32;

  const completionRate = totalTripsVal > 0 ? ((completedTripsVal / totalTripsVal) * 100).toFixed(1) : "84.0";
  const cancellationRate = totalTripsVal > 0 ? ((cancelledTripsVal / totalTripsVal) * 100).toFixed(1) : "4.8";
  const pendingRate = totalTripsVal > 0 ? ((pendingTripsVal / totalTripsVal) * 100).toFixed(1) : "11.1";
  const rejectedRate = totalTripsVal > 0 ? ((rejectedTripsVal / totalTripsVal) * 100).toFixed(1) : "2.6";

  const totalRevenueVal = m?.totalRevenue ?? 52480;
  const outstandingVal = m?.outstandingPayments ?? 8750;
  const outstandingPct = totalRevenueVal > 0 ? ((outstandingVal / totalRevenueVal) * 100).toFixed(1) : "16.7";

  const activeDriversVal = m?.activeDrivers ?? 42;
  const onTripDriversVal = m?.onTripDrivers ?? 6;
  const totalPassengersVal = m?.totalPassengers ?? 865;
  const newPassengersVal = m?.newPassengersThisWeek ?? 34;

  const dynamicMetrics = [
    [
      "Total ride requests",
      m ? totalTripsVal.toLocaleString() : "1,248",
      "+12% from last month",
      TicketCheck,
      "bg-blue-50 text-blue-600",
      true,
    ],
    [
      "Completed rides",
      m ? completedTripsVal.toLocaleString() : "1,050",
      `${completionRate}% completion rate`,
      UserRoundCheck,
      "bg-emerald-50 text-emerald-600",
      true,
    ],
    [
      "Pending rides",
      m ? pendingTripsVal.toLocaleString() : "138",
      "Waiting for approval",
      Clock3,
      "bg-amber-50 text-amber-600",
      null,
    ],
    [
      "Cancelled rides",
      m ? cancelledTripsVal.toLocaleString() : "60",
      `${cancellationRate}% cancellation rate`,
      XCircle,
      "bg-red-50 text-red-500",
      false,
    ],
    [
      "Total revenue",
      m ? `$${totalRevenueVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$52,480",
      "+8.3% from last month",
      CircleDollarSign,
      "bg-emerald-50 text-emerald-600",
      true,
    ],
    [
      "Outstanding payments",
      m ? `$${outstandingVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$8,750",
      `${outstandingPct}% of total revenue`,
      CircleDollarSign,
      "bg-amber-50 text-amber-600",
      null,
    ],
    [
      "Active drivers",
      m ? String(activeDriversVal) : "42",
      `${onTripDriversVal} currently on a trip`,
      UserRoundCheck,
      "bg-blue-50 text-blue-600",
      null,
    ],
    [
      "Total passengers",
      m ? totalPassengersVal.toLocaleString() : "865",
      `+${newPassengersVal} new this week`,
      UsersRound,
      "bg-violet-50 text-violet-600",
      true,
    ],
  ] as const;


  // Monthly performance chart bars calculation
  const liveMonthlyPerf = analyticsData?.monthlyRidePerformance || [];
  const maxPerfVal = Math.max(1, ...liveMonthlyPerf.map(i => Math.max(i.requested, i.completed)));
  const monthlyBars = liveMonthlyPerf.length > 0
    ? liveMonthlyPerf.map(i => [
        i.month,
        Math.min(100, Math.max(6, Math.round((i.requested / maxPerfVal) * 100))),
        Math.min(100, Math.max(6, Math.round((i.completed / maxPerfVal) * 100))),
      ] as const)
    : defaultMonths;

  // Driver Table Data
  const topDriversData = analyticsData?.topDrivers && analyticsData.topDrivers.length > 0
    ? analyticsData.topDrivers.map(d => [d.initials, d.name, String(d.trips), d.rating, d.revenue, d.status] as const)
    : defaultDrivers;

  // Ride Table Data
  const recentRidesData = analyticsData?.recentRideRequests && analyticsData.recentRideRequests.length > 0
    ? analyticsData.recentRideRequests.map(r => [r.id, r.passenger, r.destination, r.status, r.price] as const)
    : defaultRides;

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
            ["Today's revenue", rev ? `$${rev.todayRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$2,840", "text-emerald-600"],
            ["Weekly revenue", rev ? `$${rev.weeklyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$18,620", "text-blue-600"],
            ["Monthly revenue", rev ? `$${rev.monthlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$52,480", "text-blue-600"],
            ["Yearly revenue", rev ? `$${rev.yearlyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$584,200", "text-blue-600"],
            ["Outstanding balance", rev ? `$${rev.outstandingBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$8,750", "text-orange-500"],
            ["Avg ride price", rev ? `$${rev.avgRidePrice.toFixed(2)}` : "$42.05", "text-foreground"],
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
          {data.map(([initials, name, trips, rating, revenue, status]) => (
            <tr className="border-t border-border" key={name}>
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
          {data.map(([id, passenger, destination, status, price]) => (
            <tr className="border-t border-border" key={id}>
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
  let pathD1 = "M25 155 C85 135 115 105 170 145 S250 60 315 85 S395 135 450 78 S550 65 680 92";
  let pathD2 = "M25 158 C85 137 115 108 170 147 S250 62 315 87 S395 137 450 80 S550 67 680 94";

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
