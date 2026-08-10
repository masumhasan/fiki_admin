"use client";

import { useEffect, useState } from "react";
import { getAdminTripsApi } from "@/lib/api";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  RefreshCw,
  Send,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";
import {
  DriverPerformanceChart,
  WeeklyTripChart,
} from "@/components/dashboard/dashboard-charts";

const card =
  "rounded-[18px] border border-[#e1e5ea] bg-white shadow-[0_9px_24px_rgba(15,35,65,0.07)]";

const drivers = [
  ["MW", "Marcus Williams", "Sienna", "Active", "#082552"],
  ["AP", "Aisha Patel", "Odyssey", "Active", "#7439ed"],
  ["RT", "Robert Thompson", "Transit", "On Trip", "#2665e7"],
  ["LC", "Linda Chen", "Caravan", "Active", "#dc2626"],
  ["JM", "James Morrison", "Highlander", "Off Duty", "#0794b5"],
];

const trips = [
  [
    "T-0391",
    "SJ",
    "Sarah",
    "Marcus",
    "123 Oak Avenue",
    "City Medical Center",
    "Onboard",
    "9:00 AM",
    "#7c3aed",
  ],
  [
    "T-0390",
    "JC",
    "James",
    "Aisha",
    "45 Maple Street",
    "Downtown Terminal",
    "Completed",
    "7:30 AM",
    "#2563eb",
  ],
  [
    "T-0389",
    "MR",
    "Maria",
    "Robert",
    "78 Pine Road",
    "Westside Mall",
    "Scheduled",
    "11:00 AM",
    "#dc2626",
  ],
  [
    "T-0388",
    "DK",
    "David",
    "Linda",
    "156 Elm Street",
    "Central Library",
    "Completed",
    "2:00 PM",
    "#0891b2",
  ],
  [
    "T-0387",
    "ET",
    "Emma",
    "—",
    "220 Birch Ave",
    "Airport Terminal 2",
    "Need Driver",
    "5:30 AM",
    "#16a34a",
  ],
];

const requests = [
  [
    "SJ",
    "Sarah Johnson",
    "123 Oak Avenue, District 5 → City Medical Center, Block A",
    "Pending",
    "Jul 16, 2026",
    "#7c3aed",
  ],
  [
    "JC",
    "James Chen",
    "45 Maple Street, Unit 3B → Downtown Bus Terminal",
    "Approved",
    "Jul 16, 2026",
    "#2563eb",
  ],
  [
    "MR",
    "Maria Rodriguez",
    "78 Pine Road, Apt 12 → Westside Shopping Center",
    "Need Driver",
    "Jul 17, 2026",
    "#dc2626",
  ],
  [
    "DK",
    "David Kim",
    "156 Elm Street → Central Library",
    "Completed",
    "Jul 15, 2026",
    "#0891b2",
  ],
];

export default function DashboardPage() {
  const [liveTrips, setLiveTrips] = useState<any[] | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      if (token) {
        getAdminTripsApi(token).then((res) => {
          if (res.success && res.data && Array.isArray(res.data.trips)) {
            const mapped = res.data.trips.map((t: any) => {
              const passengerName = t.passengerId?.name || "Passenger";
              const driverName = t.driverId?.name || "Unassigned";
              const ini = passengerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "PA";

              let statusStr = "Scheduled";
              if (t.status === "COMPLETED") statusStr = "Completed";
              else if (t.status === "IN_PROGRESS") statusStr = "Onboard";
              else if (t.status === "REQUESTED") statusStr = "Need Driver";

              return [
                `T-${t._id.substring(t._id.length - 4).toUpperCase()}`,
                ini,
                passengerName,
                driverName,
                t.pickupLocation?.address || "Pickup Address",
                t.dropoffLocation?.address || "Dropoff Address",
                statusStr,
                t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now",
                "#2563eb",
              ];
            });
            if (mapped.length > 0) {
              setLiveTrips(mapped);
            }
          }
        });
      }
    }
  }, []);

  const activeTripsList = liveTrips || trips;

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<Send />}
          label="Today's Trips"
          value="71"
          change="+12%"
          color="#173d76"
        />
        <Metric
          icon={<CircleAlert />}
          label="Pending Requests"
          value="14"
          change="+3"
          color="#f39200"
        />
        <Metric
          icon={<UserRoundCheck />}
          label="Active Drivers"
          value="18"
          change="+2"
          color="#10ac7b"
        />
        <Metric
          icon={<CheckCircle2 />}
          label="Completed Trips"
          value="65"
          change="91.5%"
          color="#8345ed"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,2.65fr)_minmax(270px,1fr)]">
        <article className={`${card} min-w-0 p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">
                Weekly Trip Volume
              </h2>
              <p className="mt-0.5 text-xs text-[#8b95a7]">
                Jul 9 — Jul 15, 2026
              </p>
            </div>
            <div className="flex gap-1.5 text-xs">
              <button
                type="button"
                className="rounded-lg bg-[#0b2b58] px-3 py-2 text-white"
              >
                Week
              </button>
              <button
                type="button"
                className="rounded-lg border px-3 py-2 text-[#69758a]"
              >
                Month
              </button>
              <button
                type="button"
                className="rounded-lg border px-3 py-2 text-[#69758a]"
              >
                Year
              </button>
            </div>
          </div>
          <WeeklyTripChart className="mt-4 h-48 w-full" />
          <div className="mt-2 flex gap-6 text-xs text-[#7c8799]">
            <span className="flex items-center gap-2">
              <i className="h-0.5 w-3 bg-[#0b2b58]" />
              Total Trips
            </span>
            <span className="flex items-center gap-2">
              <i className="h-0.5 w-3 bg-[#f5ad00]" />
              Completed
            </span>
          </div>
        </article>
        <article className={`${card} p-5`}>
          <h2 className="text-lg font-bold text-[#172033]">Driver Status</h2>
          <div className="mt-5 space-y-4">
            {drivers.map(([initials, name, car, status, color]) => (
              <div className="flex items-center gap-3" key={name}>
                <Avatar initials={initials} color={color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#273044]">
                    {name}
                  </p>
                  <p className="text-[11px] text-[#8a94a6]">{car}</p>
                </div>
                <Badge status={status} />
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,2.65fr)_minmax(270px,1fr)]">
        <article className={`${card} min-w-0 overflow-hidden p-6`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">
                Live Dispatch Board
              </h2>
              <p className="text-xs text-[#8b95a7]">Real-time trip overview</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs text-[#69758a]"
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </button>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[770px] text-left text-xs">
              <thead className="border-b text-[#687386]">
                <tr>
                  {[
                    "Trip ID",
                    "Passenger",
                    "Driver",
                    "Pickup",
                    "Destination",
                    "Status",
                    "Time",
                  ].map((x) => (
                    <th className="px-2.5 py-3 font-semibold" key={x}>
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeTripsList.map(
                  (
                    [
                      id,
                      ini,
                      passenger,
                      driver,
                      pickup,
                      destination,
                      status,
                      time,
                      color,
                    ],
                    i,
                  ) => (
                    <tr
                      className={`border-b ${i % 2 ? "bg-[#fafafa]" : ""}`}
                      key={id}
                    >
                      <td className="px-2.5 py-3 font-bold text-[#16345e]">
                        {id}
                      </td>
                      <td className="px-2.5 py-3">
                        <span className="flex items-center gap-2">
                          <Avatar small initials={ini} color={color} />
                          {passenger}
                        </span>
                      </td>
                      <td className="px-2.5 py-3">{driver}</td>
                      <td className="px-2.5 py-3 text-[#7d8799]">{pickup}</td>
                      <td className="px-2.5 py-3 text-[#7d8799]">
                        {destination}
                      </td>
                      <td className="px-2.5 py-3">
                        <Badge status={status} />
                      </td>
                      <td className="px-2.5 py-3 text-[#7d8799]">{time}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="mt-4 flex items-center gap-1 text-xs font-bold text-[#16345e]"
          >
            View all trips <ArrowRight className="size-3.5" />
          </button>
        </article>
        <ActivityFeed />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className={`${card} p-6`}>
          <div className="flex justify-between">
            <h2 className="text-lg font-bold text-[#172033]">
              Recent Ride Requests
            </h2>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-bold"
            >
              View all <ArrowRight className="size-3.5" />
            </button>
          </div>
          <div className="mt-5 space-y-2.5">
            {requests.map(([ini, name, route, status, date, color]) => (
              <div
                className="flex items-center gap-3 rounded-xl border p-3"
                key={name}
              >
                <Avatar initials={ini} color={color} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#293246]">{name}</p>
                  <p className="truncate text-xs text-[#8993a5]">{route}</p>
                </div>
                <div className="text-right">
                  <Badge status={status} />
                  <p className="mt-1 text-[11px] text-[#9aa3b2]">{date}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className={`${card} p-6`}>
          <h2 className="text-lg font-bold text-[#172033]">
            Driver Performance
          </h2>
          <p className="text-xs text-[#8b95a7]">Trips this week</p>
          <DriverPerformanceChart className="mt-5 h-52 w-full" />
        </article>
      </section>

      <section className={`${card} p-6`}>
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#172033]">
              Upcoming Schedule
            </h2>
            <p className="text-xs text-[#8b95a7]">Next 3 days</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-bold"
          >
            View schedule <ArrowRight className="size-3.5" />
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <ScheduleDay
            title="Today"
            date="Jul 15"
            rows={[
              ["Sarah Johnson", "9:00 AM", "#22c55e"],
              ["James Chen", "7:30 AM", "#3b82f6"],
              ["Maria Rodriguez", "11:00 AM", "#3b82f6"],
              ["Emma Thompson", "5:30 AM", "#ef4444"],
            ]}
          />
          <ScheduleDay
            title="Tomorrow"
            date="Jul 16"
            rows={[["Robert Park", "10:00 AM", "#3b82f6"]]}
          />
          <ScheduleDay
            title="Thu Jul 17"
            date="Jul 17"
            rows={[["Maria Rodriguez", "11:00 AM", "#ef4444"]]}
          />
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  color: string;
}) {
  return (
    <article
      className="relative min-h-39 overflow-hidden rounded-[18px] p-5 text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      <div className="absolute -right-5 -top-9 size-28 rounded-full bg-white/6" />
      <div className="absolute -bottom-8 right-0 size-20 rounded-full bg-white/5" />
      <div className="relative flex justify-between">
        <span className="grid size-11 place-items-center rounded-xl bg-white/18 [&_svg]:size-5">
          {icon}
        </span>
        <span className="flex h-7 items-center gap-1 rounded-full bg-white/15 px-2.5 text-[11px] font-bold">
          <TrendingUp className="size-3" />
          {change}
        </span>
      </div>
      <p className="relative mt-4 text-sm text-white/80">{label}</p>
      <p className="relative mt-1 text-3xl font-bold">{value}</p>
    </article>
  );
}
function Avatar({
  initials,
  color,
  small = false,
}: {
  initials: string;
  color: string;
  small?: boolean;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${small ? "size-6 text-[8px]" : "size-8 text-[10px]"}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}
function Badge({ status }: { status: string }) {
  const tone =
    status === "Active" ||
    status === "Completed" ||
    status === "Approved" ||
    status === "Onboard"
      ? "bg-emerald-50 text-emerald-600"
      : status === "On Trip" || status === "Scheduled"
        ? "bg-blue-50 text-blue-500"
        : status === "Pending"
          ? "bg-amber-50 text-amber-500"
          : status === "Need Driver"
            ? "bg-red-50 text-red-400"
            : "bg-slate-50 text-slate-400";
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}
    >
      {status}
    </span>
  );
}
function ActivityFeed() {
  const items = [
    ["Trip T-0390 completed successfully", "8 min ago", "#22c55e"],
    ["New ride request from Patricia Lee", "12 min ago", "#3b82f6"],
    ["Trip T-0387 needs driver assignment", "24 min ago", "#f59e0b"],
    ["Ride request RR-2843 was rejected", "41 min ago", "#ff5a5f"],
    ["Marcus Williams checked in — on duty", "1h ago", "#22c55e"],
    ["Trip T-0391 started — passenger boarded", "1h 12m ago", "#16345e"],
  ];
  return (
    <article className={`${card} p-5`}>
      <h2 className="text-lg font-bold text-[#172033]">Activity Feed</h2>
      <p className="text-xs text-[#8b95a7]">Latest updates</p>
      <div className="mt-5 space-y-4">
        {items.map(([title, time, color], i) => (
          <div className="relative flex gap-3" key={title}>
            {i < items.length - 1 && (
              <span className="absolute left-[9px] top-4 h-9 w-px bg-[#e4e8ee]" />
            )}
            <span
              className="relative mt-0.5 size-5 shrink-0 rounded-full border-2 bg-white"
              style={{ borderColor: color }}
            >
              <i
                className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: color }}
              />
            </span>
            <div>
              <p className="text-xs text-[#343c4d]">{title}</p>
              <p className="mt-1 text-[11px] text-[#a0a9b7]">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
function ScheduleDay({
  title,
  date,
  rows,
}: {
  title: string;
  date: string;
  rows: string[][];
}) {
  return (
    <div className="min-h-40 rounded-xl border bg-[#fafbfc] p-4">
      <div className="flex justify-between text-xs">
        <strong>{title}</strong>
        <span className="text-[#8993a5]">{date}</span>
      </div>
      <div className="mt-4 space-y-3">
        {rows.map(([name, time, color]) => (
          <div className="flex items-center text-xs" key={name}>
            <i
              className="mr-2 size-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>{name}</span>
            <span className="ml-auto text-[#9aa4b4]">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
