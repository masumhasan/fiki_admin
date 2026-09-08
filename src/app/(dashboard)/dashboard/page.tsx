"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminTripsApi, getAdminAnalyticsApi } from "@/lib/api";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  MapPin,
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

const trips: any[] = [];

function formatTimeTo12Hour(timeStr?: string): string {
  if (!timeStr) return "—";
  const trimmed = timeStr.trim();
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(trimmed);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampmParam = match[3] ? match[3].toUpperCase() : null;
  if (ampmParam) return `${hours}:${minutes} ${ampmParam}`;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export default function DashboardPage() {
  const [liveTrips, setLiveTrips] = useState<any[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any | null>(null);
  const [tripFilter, setTripFilter] = useState("week"); // "week", "month", "year"
  const [driverPerfFilter, setDriverPerfFilter] = useState("week"); // "week", "fortnight", "month", "year"

  const fetchLiveTrips = async () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) return;
    setRefreshing(true);
    try {
      const res = await getAdminTripsApi(token, 1, 10, "IN_PROGRESS", "live");
      if (res.success && res.data && Array.isArray(res.data.trips)) {
        const onboardOnly = res.data.trips.filter((t: any) => t.status === "IN_PROGRESS");
        const mapped = onboardOnly.map((t: any) => {
          const passengerName =
            t.fullName ||
            t.passengerId?.fullName ||
            t.passengerId?.name ||
            "Passenger";
          const driverName = t.driverId?.name || "Unassigned";
          const ini =
            passengerName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .substring(0, 2) || "PA";

          const timeStr = t.pickupTime
            ? formatTimeTo12Hour(t.pickupTime)
            : t.createdAt
              ? new Date(t.createdAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "America/Chicago",
                })
              : "—";

          return [
            `TRP-${t._id.substring(t._id.length - 4).toUpperCase()}`,
            ini,
            passengerName,
            driverName,
            t.pickupLocation?.address || "Pickup Address",
            t.dropoffLocation?.address || "Dropoff Address",
            "Onboard",
            timeStr,
            "#2563eb",
            t.passengerAvatarUrl || t.passengerId?.avatarUrl || "",
          ];
        });
        setLiveTrips(mapped);
      } else {
        setLiveTrips([]);
      }
    } catch {
      setLiveTrips([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveTrips();
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      if (token) {
        getAdminAnalyticsApi(token).then((res) => {
          if (res.success && res.data) {
            setStats(res.data);
          }
        });
      }
    }
  }, []);

  const activeTripsList = liveTrips || [];
  const metrics = {
    todayTrips: 0,
    pendingRequests: 0,
    activeDrivers: 0,
    completedTrips: 0,
    ...(stats?.metrics || {}),
  };
  const weeklyTripVolume = stats?.weeklyTripVolume || [];
  const monthlyTripVolume = stats?.monthlyTripVolume || [];
  const yearlyTripVolume = stats?.yearlyTripVolume || [];
  const tripVolumeData =
    tripFilter === "week"
      ? weeklyTripVolume
      : tripFilter === "month"
        ? monthlyTripVolume
        : yearlyTripVolume;

  const driverStatusList = stats?.driverStatus || [];
  const pendingRideRequestsList = stats?.pendingRideRequests || [];
  const recentRideRequests = stats?.recentRideRequests || [];

  const driverPerformance = stats?.driverPerformance || {};
  const driverPerfData = driverPerformance[driverPerfFilter] || [];
  const driverPerfText =
    driverPerfFilter === "week"
      ? "Trips this week"
      : driverPerfFilter === "fortnight"
        ? "Trips this fortnight"
        : driverPerfFilter === "month"
          ? "Trips this month"
          : "Trips this year";

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<Send />}
          label="Today's Trips"
          value={(metrics.todayTrips ?? 0).toString()}
          change=""
          color="#173d76"
          isLoading={stats === null}
        />
        <Metric
          icon={<CircleAlert />}
          label="Pending Requests"
          value={(metrics.pendingRequests ?? metrics.pendingTrips ?? 0).toString()}
          change=""
          color="#f39200"
          isLoading={stats === null}
        />
        <Metric
          icon={<UserRoundCheck />}
          label="Active Drivers"
          value={(metrics.activeDrivers ?? 0).toString()}
          change=""
          color="#10ac7b"
          isLoading={stats === null}
        />
        <Metric
          icon={<CheckCircle2 />}
          label="Completed Trips"
          value={(metrics.completedTrips ?? 0).toString()}
          change=""
          color="#8345ed"
          isLoading={stats === null}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,2.65fr)_minmax(270px,1fr)]">
        <article className={`${card} min-w-0 p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">
                {tripFilter === "week"
                  ? "Weekly"
                  : tripFilter === "month"
                    ? "Monthly"
                    : "Yearly"}{" "}
                Trip Volume
              </h2>
              <p className="mt-0.5 text-xs text-[#8b95a7]">
                Jul 9 — Jul 15, 2026
              </p>
            </div>
            <div className="flex gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setTripFilter("week")}
                className={`rounded-lg px-3 py-2 ${tripFilter === "week" ? "bg-[#0b2b58] text-white" : "border text-[#69758a]"}`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setTripFilter("month")}
                className={`rounded-lg px-3 py-2 ${tripFilter === "month" ? "bg-[#0b2b58] text-white" : "border text-[#69758a]"}`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => setTripFilter("year")}
                className={`rounded-lg px-3 py-2 ${tripFilter === "year" ? "bg-[#0b2b58] text-white" : "border text-[#69758a]"}`}
              >
                Year
              </button>
            </div>
          </div>
          {stats === null ? (
            <div className="mt-4 h-48 w-full animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <WeeklyTripChart
              className="mt-4 h-48 w-full"
              data={tripVolumeData}
            />
          )}
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
            {stats === null ? (
              [...Array(5)].map((_, i) => (
                <div className="flex items-center gap-3 animate-pulse" key={i}>
                  <div className="size-8 rounded-full bg-slate-200 shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3.5 w-24 rounded bg-slate-200" />
                    <div className="h-2.5 w-16 rounded bg-slate-200" />
                  </div>
                  <div className="h-5 w-12 rounded-full bg-slate-200" />
                </div>
              ))
            ) : driverStatusList.length === 0 ? (
              <p className="text-xs text-[#8a94a6]">No active drivers.</p>
            ) : (
              driverStatusList.map((driver: any) => (
                <div className="flex items-center gap-3" key={driver.id}>
                  <Avatar initials={driver.initials} color={driver.color} url={driver.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#273044]">
                      {driver.name}
                    </p>
                    <p className="text-[11px] text-[#8a94a6]">
                      {driver.vehicle}
                    </p>
                  </div>
                  <Badge status={driver.status} />
                </div>
              ))
            )}
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
              <p className="text-xs text-[#8b95a7]">Real-time trip overview (Onboard trips)</p>
            </div>
            <button
              type="button"
              onClick={fetchLiveTrips}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs text-[#69758a] hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
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
                {liveTrips === null ? (
                  [...Array(5)].map((_, i) => (
                    <tr
                      className={`border-b ${i % 2 ? "bg-[#fafafa]" : ""}`}
                      key={i}
                    >
                      <td colSpan={7} className="px-2.5 py-3">
                        <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : activeTripsList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-sm text-[#687386]"
                    >
                      No onboard trips at the moment.
                    </td>
                  </tr>
                ) : (
                  activeTripsList
                    .slice(0, 5)
                    .map(
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
                          avatarUrl,
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
                              {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="size-6 rounded-full object-cover shrink-0 border border-border" />
                              ) : (
                                <Avatar small initials={ini} color={color} />
                              )}
                              {passenger}
                            </span>
                          </td>
                          <td className="px-2.5 py-3">{driver}</td>
                          <td className="px-2.5 py-3 text-[#7d8799]">
                            {pickup}
                          </td>
                          <td className="px-2.5 py-3 text-[#7d8799]">
                            {destination}
                          </td>
                          <td className="px-2.5 py-3">
                            <Badge status={status} />
                          </td>
                          <td className="px-2.5 py-3 text-[#7d8799]">{time}</td>
                        </tr>
                      ),
                    )
                )}
              </tbody>
            </table>
          </div>
          <Link
            href="/ride-requests?tab=trips"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#16345e] hover:underline"
          >
            View all trips <ArrowRight className="size-3.5" />
          </Link>
        </article>
        <PendingRideRequestsCard
          items={pendingRideRequestsList}
          isLoading={stats === null}
          totalCount={metrics.pendingRequests}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className={`${card} p-6`}>
          <div className="flex justify-between">
            <h2 className="text-lg font-bold text-[#172033]">
              Recent Ride Requests
            </h2>
            <Link
              href="/ride-requests"
              className="flex items-center gap-1 text-xs font-bold"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-5 space-y-2.5">
            {stats === null ? (
              [...Array(4)].map((_, i) => (
                <div
                  className="flex items-center gap-3 rounded-xl border p-3 animate-pulse"
                  key={i}
                >
                  <div className="size-8 rounded-full bg-slate-200 shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-48 rounded bg-slate-200" />
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-5 w-16 rounded-full bg-slate-200 ml-auto" />
                    <div className="h-3 w-12 rounded bg-slate-200 ml-auto" />
                  </div>
                </div>
              ))
            ) : recentRideRequests.length === 0 ? (
              <p className="text-xs text-[#8b95a7] py-4 text-center border rounded-xl">
                No recent ride requests.
              </p>
            ) : (
              recentRideRequests.slice(0, 4).map((item: any, idx: number) => {
                const isArr = Array.isArray(item);
                const ini = isArr
                  ? item[0]
                  : item.initials ||
                    item.passenger?.substring(0, 2)?.toUpperCase() ||
                    "PA";
                const name = isArr ? item[1] : item.passenger || "Passenger";
                const route = isArr
                  ? item[2]
                  : item.destination || "Destination";
                const status = isArr ? item[3] : item.status || "Pending";
                const date = isArr
                  ? item[4]
                  : item.date || item.price || "Recently";
                const color = isArr ? item[5] : item.color || "#2563eb";
                const tripId = isArr
                  ? item[6]
                  : item.id || item.rawId || `TRP-${idx}`;
                
                const avatarUrl = isArr 
                  ? item[7] 
                  : item.passengerAvatarUrl || item.passengerId?.avatarUrl || "";

                return (
                  <div
                    className="flex items-center gap-3 rounded-xl border p-3"
                    key={tripId || name || idx}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="size-9 rounded-full object-cover shrink-0 border border-border" />
                    ) : (
                      <Avatar initials={ini} color={color} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#293246]">{name}</p>
                      <p className="truncate text-xs text-[#8993a5]">{route}</p>
                    </div>
                    <div className="text-right">
                      <Badge status={status} />
                      <p className="mt-1 text-[11px] text-[#9aa3b2]">{date}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>
        <article className={`${card} p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">
                Driver Performance
              </h2>
              <p className="mt-0.5 text-xs text-[#8b95a7]">{driverPerfText}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setDriverPerfFilter("week")}
                className={`rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 ${driverPerfFilter === "week" ? "bg-[#0b2b58] text-white" : "border text-[#69758a]"}`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setDriverPerfFilter("fortnight")}
                className={`rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 ${driverPerfFilter === "fortnight" ? "bg-[#0b2b58] text-white" : "border text-[#69758a]"}`}
              >
                Fortnightly
              </button>
              <button
                type="button"
                onClick={() => setDriverPerfFilter("month")}
                className={`rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 ${driverPerfFilter === "month" ? "bg-[#0b2b58] text-white" : "border text-[#69758a]"}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setDriverPerfFilter("year")}
                className={`rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 ${driverPerfFilter === "year" ? "bg-[#0b2b58] text-white" : "border text-[#69758a]"}`}
              >
                Yearly
              </button>
            </div>
          </div>
          {stats === null ? (
            <div className="mt-5 h-52 w-full animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <DriverPerformanceChart
              className="mt-5 h-52 w-full"
              data={driverPerfData}
            />
          )}
        </article>
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
  isLoading = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  color: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <article className="relative min-h-39 overflow-hidden rounded-[18px] bg-slate-100 p-5 shadow-sm animate-pulse">
        <div className="h-11 w-11 rounded-xl bg-slate-200" />
        <div className="mt-4 h-4 w-24 rounded bg-slate-200" />
        <div className="mt-2 h-8 w-16 rounded bg-slate-200" />
      </article>
    );
  }
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
  color = "#173d76",
  small = false,
  url,
}: {
  initials: string;
  color?: string;
  small?: boolean;
  url?: string;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={initials}
        className={`object-cover shrink-0 rounded-full ${small ? "size-6" : "size-8"}`}
      />
    );
  }
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
function PendingRideRequestsCard({
  items = [],
  isLoading = false,
  totalCount = 0,
}: {
  items?: any[];
  isLoading?: boolean;
  totalCount?: number;
}) {
  const displayCount = totalCount || items.length;

  return (
    <article className={`${card} flex flex-col p-5`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#172033]">
              Pending Ride Request
            </h2>
            {displayCount > 0 && (
              <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                {displayCount}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#8b95a7]">
            Requests awaiting review & approval
          </p>
        </div>
        <Link
          href="/ride-requests"
          className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#173d76] hover:underline"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-2.5 animate-pulse"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full bg-slate-200" />
                  <div className="space-y-1">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                    <div className="h-2.5 w-16 rounded bg-slate-200" />
                  </div>
                </div>
                <div className="h-4 w-16 rounded-full bg-slate-200" />
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 w-3/4 rounded bg-slate-200" />
                <div className="h-2.5 w-2/3 rounded bg-slate-200" />
              </div>
              <div className="h-7 w-full rounded-lg bg-slate-200 pt-1" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="size-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="text-sm font-bold text-[#172033]">
              No Pending Requests
            </p>
            <p className="mt-1 text-xs text-[#8b95a7] max-w-[220px]">
              All passenger ride requests have been confirmed or processed.
            </p>
            <Link
              href="/ride-requests"
              className="mt-4 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#52647e] transition-colors hover:bg-slate-50 hover:text-[#173d76]"
            >
              Go to Ride Requests <ArrowRight className="size-3" />
            </Link>
          </div>
        ) : (
          items.slice(0, 5).map((item) => {
            const statusTone =
              item.status === "QUOTE_COUNTERED"
                ? "bg-violet-50 text-violet-700 border-violet-200/60"
                : item.status === "QUOTE_SENT"
                ? "bg-blue-50 text-blue-700 border-blue-200/60"
                : "bg-amber-50 text-amber-700 border-amber-200/60";

            return (
              <div
                key={item.id}
                className="group relative rounded-xl border border-slate-200/80 bg-slate-50/40 p-3 transition-all duration-200 hover:border-[#173d76]/30 hover:bg-white hover:shadow-[0_4px_16px_rgba(15,35,65,0.06)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      url={item.avatarUrl}
                      initials={item.initials}
                      small
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#16345e] group-hover:text-[#173d76] transition-colors">
                        {item.passenger}
                      </p>
                      <p className="text-[10px] font-semibold text-[#8b95a7]">
                        #{item.shortId}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusTone}`}
                  >
                    {item.statusLabel || "Pending"}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1 text-xs">
                  <div className="flex items-start gap-1.5 text-[#52647e]">
                    <MapPin className="size-3 text-amber-500 shrink-0 mt-0.5" />
                    <span className="truncate text-[11px] font-medium leading-tight">
                      {item.pickup}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[#52647e]">
                    <MapPin className="size-3 text-blue-500 shrink-0 mt-0.5" />
                    <span className="truncate text-[11px] font-medium leading-tight">
                      {item.destination}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-[#8b95a7]">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                      {item.tripType}
                    </span>
                    {item.fareStr && (
                      <span className="font-bold text-emerald-700">
                        {item.fareStr}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/ride-requests/${item.id}`}
                    className="inline-flex items-center gap-1 rounded-md border border-[#173d76]/20 bg-[#173d76]/5 px-2.5 py-1 text-[11px] font-bold text-[#173d76] transition-all hover:bg-[#173d76] hover:text-white shadow-2xs active:scale-95"
                  >
                    View Request <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {items.length > 5 && (
        <div className="mt-3 pt-2 border-t border-slate-100 text-center">
          <Link
            href="/ride-requests"
            className="text-xs font-bold text-[#173d76] hover:underline"
          >
            View all {displayCount} pending requests →
          </Link>
        </div>
      )}
    </article>
  );
}
