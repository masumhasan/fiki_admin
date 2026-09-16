"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { getAdminTripsApi, deleteTripApi, getAdminDriversApi, assignDriverApi } from "@/lib/api";
import { cn } from "@/lib/utils";

type TripStatus =
  | "Onboard"
  | "Completed"
  | "Scheduled"
  | "Need driver"
  | "Cancelled";

type Trip = {
  id: string;
  mongoId: string;
  passenger: string;
  initials: string;
  avatar: string;
  passengerAvatarUrl?: string;
  driver?: string;
  driverId?: string;
  pickup: string;
  destination: string;
  status: TripStatus;
  time: string;
  date: string;
  timestamp?: number;
};

type DriverOption = {
  id: string;
  name: string;
  vehiclePlate?: string;
};

const filters = [
  "All statuses",
  "Onboard",
  "Scheduled",
  "Completed",
  "Need driver",
  "Cancelled",
] as const;

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

export type TripTab = "today" | "nextDay" | "completed" | "missed" | "all";

export function TripsPage({ hideHeader }: { hideHeader?: boolean }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] =
    useState<(typeof filters)[number]>("All statuses");
  const [activeTab, setActiveTab] = useState<TripTab>("today");
  const [tabCounts, setTabCounts] = useState({
    today: 0,
    nextDay: 0,
    completed: 0,
    missed: 0,
    all: 0,
  });
  const [pageSize, setPageSize] = useState("10");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summaryData, setSummaryData] = useState({
    totalTrips: 0,
    onboardNow: 0,
    needDriver: 0,
    completedCount: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) return;
    getAdminDriversApi(token, { approvalStatus: "APPROVED", limit: 100 }).then((res) => {
      if (res.success && res.data?.drivers) {
        const active: DriverOption[] = res.data.drivers
          .filter((d: any) => d.accountStatus === "ACTIVE" || d.profile?.approvalStatus === "APPROVED")
          .map((d: any) => ({
            id: d.id || d._id,
            name: d.name,
            vehiclePlate: d.profile?.vehicle?.licensePlate,
          }));
        setDrivers(active);
      }
    });
  }, []);

  const handleAssignDriver = async (tripMongoId: string, newDriverId: string): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) return false;

    const res = await assignDriverApi(token, tripMongoId, newDriverId);
    if (res.success) {
      const assignedDriverObj = drivers.find((d) => d.id === newDriverId);
      setTrips((prevTrips) =>
        prevTrips.map((t) => {
          if (t.mongoId === tripMongoId) {
            return {
              ...t,
              driverId: newDriverId || undefined,
              driver: assignedDriverObj?.name || (newDriverId ? "Assigned Driver" : undefined),
              status: (t.status === "Need driver" && newDriverId) ? "Scheduled" : t.status,
            };
          }
          return t;
        })
      );
      return true;
    } else {
      alert(res.error?.message || "Failed to assign driver");
      return false;
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  // Reset to page 1 if search, status, page size, or active tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, status, pageSize, activeTab]);

  const handleDeleteTrip = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip? This action is permanent.")) {
      return;
    }
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) return;
    const res = await deleteTripApi(token, id);
    if (res.success) {
      fetchTrips();
    } else {
      alert(res.error?.message || "Failed to delete trip");
    }
  };

  const fetchTrips = async () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let apiStatus = undefined;
      if (status === "Need driver") apiStatus = "REQUESTED";
      else if (status === "Scheduled") apiStatus = "ACCEPTED,DRIVER_ARRIVING,DRIVER_ARRIVED";
      else if (status === "Onboard") apiStatus = "IN_PROGRESS";
      else if (status === "Completed") apiStatus = "COMPLETED";
      else if (status === "Cancelled") apiStatus = "CANCELLED";

      const res = await getAdminTripsApi(
        token,
        currentPage,
        Number(pageSize),
        apiStatus,
        "trips",
        debouncedQuery,
        activeTab
      );
      if (res.success && res.data && Array.isArray(res.data.trips)) {
        
        if (res.data.summary) {
          setSummaryData({
            totalTrips: res.data.summary.totalTrips || 0,
            onboardNow: res.data.summary.onboardNow || 0,
            needDriver: res.data.summary.needDriver || 0,
            completedCount: res.data.summary.completedCount || 0,
          });
        }

        const countsObj = res.data.counts || res.data.summary?.tabCounts;
        if (countsObj) {
          setTabCounts({
            today: countsObj.today ?? 0,
            nextDay: countsObj.nextDay ?? countsObj.upcoming ?? 0,
            completed: countsObj.completed ?? 0,
            missed: countsObj.missed ?? 0,
            all: countsObj.all ?? res.data.summary?.totalTrips ?? 0,
          });
        }
        
        if (res.data.pagination) {
          setTotalItems(res.data.pagination.total || 0);
          setTotalPages(res.data.pagination.totalPages || 1);
        }

        const statusMap: Record<string, TripStatus> = {
          REQUESTED: "Need driver",
          ACCEPTED: "Scheduled",
          DRIVER_ARRIVING: "Scheduled",
          DRIVER_ARRIVED: "Scheduled",
          IN_PROGRESS: "Onboard",
          COMPLETED: "Completed",
          CANCELLED: "Cancelled",
        };

        const mapped: Trip[] = res.data.trips.map((t: any) => {
          const passName =
            t.fullName ||
            t.passengerId?.fullName ||
            t.passengerId?.name ||
            "Passenger";
          const driverName =
            t.driverId?.name || (t.driverId ? "Assigned Driver" : undefined);
          const statusVal = statusMap[t.status] ?? "Scheduled";

          const nameParts = passName.split(" ");
          const initials =
            nameParts.length >= 2
              ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
              : passName.substring(0, 2).toUpperCase();

          const rawDateStr = t.pickupDate || t.startDate;
          const dateStr = rawDateStr
            ? new Date(rawDateStr + (rawDateStr.includes("T") ? "" : "T00:00:00")).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "America/Chicago",
              })
            : (t.createdAt
                ? new Date(t.createdAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "America/Chicago",
                  })
                : "—");
          const timeStr = t.pickupTime
            ? formatTimeTo12Hour(t.pickupTime)
            : (t.createdAt
                ? new Date(t.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "America/Chicago",
                  })
                : "—");

          const dateValForSort = t.pickupDate || t.startDate || t.createdAt;
          let timestamp = 0;
          if (dateValForSort) {
            const rawS = String(dateValForSort).trim();
            const timeS = t.pickupTime || "00:00";
            const fullIso = rawS.includes("T") ? rawS : `${rawS}T${timeS.length === 5 ? timeS : "00:00"}:00`;
            const parsedD = new Date(fullIso);
            timestamp = !isNaN(parsedD.getTime()) ? parsedD.getTime() : new Date(t.createdAt || 0).getTime();
          }

          return {
            id: `TRP-${t._id.substring(t._id.length - 4).toUpperCase()}${t.isReturnLeg ? "-RET" : ""}`,
            mongoId: t._id,
            passenger: passName,
            initials,
            avatar: "bg-violet-600",
            passengerAvatarUrl: t.passengerAvatarUrl || t.passengerId?.avatarUrl,
            driver: driverName,
            driverId: t.driverId?._id ? String(t.driverId._id) : (typeof t.driverId === "string" ? t.driverId : undefined),
            pickup: t.pickupLocation?.address || "—",
            destination: t.dropoffLocation?.address || "—",
            status: statusVal,
            time: timeStr,
            date: dateStr,
            timestamp,
          };
        });

        mapped.sort((a, b) => {
          const tA = a.timestamp || 0;
          const tB = b.timestamp || 0;
          
          if (activeTab === 'today' || activeTab === 'nextDay') {
            return tA - tB; // Chronological order
          } else if (activeTab === 'missed') {
            // Same day: ascending time. Different day: descending date.
            const dateA = new Date(tA).setHours(0, 0, 0, 0);
            const dateB = new Date(tB).setHours(0, 0, 0, 0);
            if (dateB !== dateA) {
              return dateB - dateA;
            }
            return tA - tB;
          }
          
          return tB - tA; // Default reverse chronological
        });
        setTrips(mapped);
      } else {
        setTrips([]);
      }
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [currentPage, pageSize, debouncedQuery, status, activeTab]);

  const summary = [
    { label: "Total trips", value: summaryData.totalTrips, tone: "text-primary" },
    {
      label: "Onboard now",
      value: summaryData.onboardNow,
      tone: "text-emerald-500",
    },
    {
      label: "Need driver",
      value: summaryData.needDriver,
      tone: "text-red-500",
    },
    {
      label: "Completed",
      value: summaryData.completedCount,
      tone: "text-blue-500",
    },
  ];

  // Since filtering and pagination is server-side now, we just use trips directly
  const visibleTrips = trips;

  function exportTrips() {
    const rows = [
      [
        "Trip ID",
        "Passenger",
        "Driver",
        "Pickup",
        "Destination",
        "Status",
        "Time",
        "Date",
      ],
      ...trips.map((trip) => [
        trip.id,
        trip.passenger,
        trip.driver ?? "Unassigned",
        trip.pickup,
        trip.destination,
        trip.status,
        trip.time,
        trip.date,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "fiki-transit-trips.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {!hideHeader ? (
        <PageHeader
          title="Trips"
          description="Monitor active trips, schedules, driver assignments and ride outcomes."
          action={
            <button
              className="h-9 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground"
              onClick={exportTrips}
              type="button"
            >
              <Download className="mr-1.5 inline size-3.5" />
              Export trips
            </button>
          }
        />
      ) : (
        <div className="flex justify-end">
          <button
            className="h-9 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground"
            onClick={exportTrips}
            type="button"
          >
            <Download className="mr-1.5 inline size-3.5" />
            Export trips
          </button>
        </div>
      )}
      <section
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
        aria-label="Trip summary"
      >
        {summary.map((item) => (
          <article
            className="rounded-xl border border-[#e1e6ee] bg-card p-4 shadow-[0_4px_14px_rgba(15,37,74,.04)] sm:p-5"
            key={item.label}
          >
            <p className="text-xs font-semibold text-muted-foreground sm:text-sm">
              {item.label}
            </p>
            <p
              className={`mt-2 text-3xl font-bold leading-none tracking-[-0.04em] sm:text-4xl ${item.tone}`}
            >
              {loading ? (
                <span className="inline-block h-9 w-8 animate-pulse rounded bg-muted" />
              ) : (
                item.value
              )}
            </p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e1e6ee] bg-card shadow-[0_4px_14px_rgba(15,37,74,.04)]">
        <header className="flex flex-col gap-3 border-b border-border px-5 py-2.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search Input */}
            <div className="relative w-full lg:w-64 shrink-0">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-icon" />
              <input
                className="h-10 w-full rounded-lg border border-input bg-muted pl-11 pr-4 text-sm outline-none placeholder:text-brand-placeholder focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search trips..."
                type="search"
                value={query}
              />
            </div>

            {/* Horizontal Filter Tabs: Today's Trips, Next Day's Trips, Completed Trips, Missed Trips, All Trips */}
            <div className="flex items-center gap-1 overflow-x-auto border-b border-border lg:border-b-0 py-1 lg:py-0">
              {[
                { id: "today" as const, label: "Today's Trips", count: tabCounts.today },
                { id: "nextDay" as const, label: "Next Day's Trips", count: tabCounts.nextDay },
                { id: "completed" as const, label: "Completed Trips", count: tabCounts.completed },
                { id: "missed" as const, label: "Missed Trips", count: tabCounts.missed },
                { id: "all" as const, label: "All Trips", count: tabCounts.all },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const isMissed = tab.id === "missed";
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative px-3.5 py-2.5 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer",
                      isActive
                        ? isMissed
                          ? "text-red-600 font-extrabold"
                          : "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab.label} ({tab.count})
                    {isActive && (
                      <span
                        className={cn(
                          "absolute inset-x-2 bottom-0 h-0.5 rounded-full",
                          isMissed ? "bg-red-600" : "bg-primary",
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="relative shrink-0">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-icon" />
            <select
              aria-label="Filter trips by status"
              className="h-10 w-full appearance-none rounded-lg border border-input bg-card pl-11 pr-9 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 sm:w-44 cursor-pointer"
              onChange={(event) =>
                setStatus(event.target.value as (typeof filters)[number])
              }
              value={status}
            >
              {filters.map((filter) => (
                <option key={filter}>{filter}</option>
              ))}
            </select>
            <ChevronDownIcon />
          </div>
        </header>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary/50" />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1150px] table-fixed text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/55 text-[11px] font-bold text-muted-foreground">
                    <th className="w-20 px-5 py-3.5">Trip ID</th>
                    <th className="w-40 py-3.5">Passenger</th>
                    <th className="w-56 py-3.5">Driver</th>
                    <th className="w-36 py-3.5">Pickup</th>
                    <th className="w-36 py-3.5">Destination</th>
                    <th className="w-28 py-3.5">Status</th>
                    <th className="w-24 py-3.5">Time</th>
                    <th className="w-24 py-3.5">Date</th>
                    <th className="w-24 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTrips.map((trip) => (
                    <TripRow
                      key={trip.mongoId}
                      trip={trip}
                      drivers={drivers}
                      onAssignDriver={handleAssignDriver}
                      onDelete={handleDeleteTrip}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border lg:hidden">
              {visibleTrips.map((trip) => (
                <TripCard
                  key={trip.mongoId}
                  trip={trip}
                  drivers={drivers}
                  onAssignDriver={handleAssignDriver}
                  onDelete={handleDeleteTrip}
                />
              ))}
            </div>

            {visibleTrips.length === 0 && (
              <div className="px-5 py-16 text-center">
                <Search className="mx-auto size-8 text-brand-soft" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {totalItems === 0
                    ? "No trips recorded yet"
                    : "No trips match your search"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {totalItems === 0
                    ? "Ride trips will appear here once passengers request rides."
                    : "Try another search or status filter."}
                </p>
              </div>
            )}
          </>
        )}

        <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Rows{" "}
              <select
                className="h-9 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-foreground"
                value={pageSize}
                onChange={(event) => setPageSize(event.target.value)}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <strong className="text-foreground">
                {visibleTrips.length === 0 ? 0 : (currentPage - 1) * Number(pageSize) + 1}
              </strong>{" "}
              to <strong className="text-foreground">{Math.min(currentPage * Number(pageSize), totalItems)}</strong> of{" "}
              <strong className="text-foreground">{totalItems}</strong>{" "}
              trips
            </p>
          </div>
          <nav aria-label="Pagination" className="flex items-center gap-1.5">
            <button
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted hover:text-primary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground [&_svg]:size-4 cursor-pointer"
              type="button"
            >
              <ChevronLeft />
            </button>

            {totalPages <= 7 ? (
              Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "grid size-9 place-items-center rounded-lg text-xs font-bold transition-colors cursor-pointer",
                    pageNum === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-foreground hover:bg-muted",
                  )}
                  type="button"
                >
                  {pageNum}
                </button>
              ))
            ) : (
              <>
                {[1, 2].map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "grid size-9 place-items-center rounded-lg text-xs font-bold transition-colors cursor-pointer",
                      pageNum === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-foreground hover:bg-muted",
                    )}
                    type="button"
                  >
                    {pageNum}
                  </button>
                ))}
                {currentPage > 3 && <span className="px-1 text-xs text-muted-foreground">...</span>}
                {currentPage > 2 && currentPage < totalPages - 1 && (
                  <button
                    onClick={() => setCurrentPage(currentPage)}
                    className="grid size-9 place-items-center rounded-lg text-xs font-bold bg-primary text-primary-foreground"
                    type="button"
                  >
                    {currentPage}
                  </button>
                )}
                {currentPage < totalPages - 2 && <span className="px-1 text-xs text-muted-foreground">...</span>}
                {[totalPages - 1, totalPages].map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "grid size-9 place-items-center rounded-lg text-xs font-bold transition-colors cursor-pointer",
                      pageNum === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-foreground hover:bg-muted",
                    )}
                    type="button"
                  >
                    {pageNum}
                  </button>
                ))}
              </>
            )}

            <button
              aria-label="Next page"
              disabled={currentPage === totalPages || totalPages === 0 || visibleTrips.length === 0}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted hover:text-primary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground [&_svg]:size-4 cursor-pointer"
              type="button"
            >
              <ChevronRight />
            </button>
          </nav>
        </footer>
      </section>
    </div>
  );
}

function TripRow({
  trip,
  drivers,
  onAssignDriver,
  onDelete,
}: {
  trip: Trip;
  drivers: DriverOption[];
  onAssignDriver: (tripMongoId: string, driverId: string) => Promise<boolean>;
  onDelete?: (id: string) => void;
}) {
  const [selectedDriverId, setSelectedDriverId] = useState(trip.driverId || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setSelectedDriverId(trip.driverId || "");
  }, [trip.driverId]);

  const isChanged = (selectedDriverId || "") !== (trip.driverId || "");

  const handleUpdate = async () => {
    setIsUpdating(true);
    setIsSuccess(false);
    const ok = await onAssignDriver(trip.mongoId, selectedDriverId);
    setIsUpdating(false);
    if (ok) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2200);
    }
  };

  return (
    <tr className="border-b border-border/80 text-xs last:border-0 hover:bg-muted/35 transition-colors">
      <td className="px-5 py-3.5 font-bold text-primary">{trip.id}</td>
      <td className="py-3.5">
        <Passenger trip={trip} />
      </td>
      <td className="py-2.5 pr-3">
        <div className="flex items-center gap-1.5">
          <div className="relative min-w-[145px] max-w-[185px] flex-1">
            <select
              value={selectedDriverId}
              onChange={(e) => {
                setSelectedDriverId(e.target.value);
                setIsSuccess(false);
              }}
              disabled={isUpdating}
              className={cn(
                "h-8 w-full appearance-none rounded-lg border bg-white pl-2.5 pr-7 text-[11px] font-medium text-foreground outline-none transition cursor-pointer",
                isChanged
                  ? "border-primary ring-2 ring-primary/15 bg-blue-50/20 font-semibold"
                  : "border-border hover:border-primary/50 focus:border-primary"
              )}
              title={trip.driver || "Unassigned"}
            >
              <option value="">— Unassigned —</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.vehiclePlate ? `(${d.vehiclePlate})` : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating || (!isChanged && !selectedDriverId && !trip.driverId)}
            title={isChanged ? "Save driver assignment" : "Update driver assignment"}
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
              isSuccess
                ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-xs"
                : isChanged
                ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-muted"
            )}
          >
            {isUpdating ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : isSuccess ? (
              <Check className="size-3.5 text-emerald-600 stroke-[2.5]" />
            ) : (
              <RefreshCw className={cn("size-3.5 stroke-[2]", isChanged && "text-primary-foreground")} />
            )}
          </button>
        </div>
      </td>
      <td className="truncate pr-3 text-muted-foreground" title={trip.pickup}>
        {trip.pickup}
      </td>
      <td
        className="truncate pr-3 text-muted-foreground"
        title={trip.destination}
      >
        {trip.destination}
      </td>
      <td>
        <StatusBadge status={trip.status} />
      </td>
      <td className="font-medium text-muted-foreground">{trip.time}</td>
      <td className="text-muted-foreground">{trip.date}</td>
      <td>
        <div className="flex justify-center gap-1.5">
          <Link
            aria-label={`View ${trip.id}`}
            className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/30 hover:bg-muted hover:text-primary cursor-pointer"
            href={`/trips/${trip.mongoId || trip.id}`}
          >
            <Eye className="size-4" />
          </Link>
          <button
            type="button"
            aria-label={`Delete ${trip.id}`}
            onClick={() => onDelete?.(trip.mongoId || trip.id)}
            className="grid size-8 place-items-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700 cursor-pointer"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function TripCard({
  trip,
  drivers,
  onAssignDriver,
  onDelete,
}: {
  trip: Trip;
  drivers: DriverOption[];
  onAssignDriver: (tripMongoId: string, driverId: string) => Promise<boolean>;
  onDelete?: (id: string) => void;
}) {
  const [selectedDriverId, setSelectedDriverId] = useState(trip.driverId || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setSelectedDriverId(trip.driverId || "");
  }, [trip.driverId]);

  const isChanged = (selectedDriverId || "") !== (trip.driverId || "");

  const handleUpdate = async () => {
    setIsUpdating(true);
    setIsSuccess(false);
    const ok = await onAssignDriver(trip.mongoId, selectedDriverId);
    setIsUpdating(false);
    if (ok) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2200);
    }
  };

  return (
    <article className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <strong className="text-xs text-primary">{trip.id}</strong>
          <div className="mt-3">
            <Passenger trip={trip} />
          </div>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      <div className="mt-4 rounded-lg border border-border/80 bg-muted/20 p-3">
        <label className="text-[11px] font-bold uppercase text-muted-foreground">Driver</label>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={selectedDriverId}
              onChange={(e) => {
                setSelectedDriverId(e.target.value);
                setIsSuccess(false);
              }}
              disabled={isUpdating}
              className={cn(
                "h-8 w-full appearance-none rounded-lg border bg-white pl-2.5 pr-7 text-xs font-medium text-foreground outline-none transition cursor-pointer",
                isChanged
                  ? "border-primary ring-2 ring-primary/15 bg-blue-50/20 font-semibold"
                  : "border-border hover:border-primary/50 focus:border-primary"
              )}
            >
              <option value="">— Unassigned —</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.vehiclePlate ? `(${d.vehiclePlate})` : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating || (!isChanged && !selectedDriverId && !trip.driverId)}
            className={cn(
              "flex h-8 items-center gap-1 px-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
              isSuccess
                ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                : isChanged
                ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-muted"
            )}
          >
            {isUpdating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : isSuccess ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <RefreshCw className="size-3.5" />
                <span>Update</span>
              </>
            )}
          </button>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
        <Info label="Schedule" value={`${trip.date} · ${trip.time}`} />
        <Info label="Status" value={trip.status} />
        <Info label="Pickup" value={trip.pickup} />
        <Info label="Destination" value={trip.destination} />
      </dl>
      <div className="mt-4 flex gap-2">
        <Link
          className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-bold text-primary hover:bg-muted"
          href={`/trips/${trip.mongoId || trip.id}`}
        >
          <Eye className="size-3.5" />
          View
        </Link>
        <button
          type="button"
          onClick={() => onDelete?.(trip.mongoId || trip.id)}
          className="flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 hover:bg-red-100 cursor-pointer"
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>
    </article>
  );
}

function Passenger({ trip }: { trip: Trip }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white overflow-hidden ${trip.avatar}`}
      >
        {trip.passengerAvatarUrl ? (
          <img src={trip.passengerAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          trip.initials
        )}
      </span>
      <span className="truncate text-[13px] font-semibold text-foreground">
        {trip.passenger}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: TripStatus }) {
  const styles: Record<TripStatus, string> = {
    Onboard: "bg-emerald-50 text-emerald-700",
    Completed: "bg-green-50 text-green-700",
    Scheduled: "bg-blue-50 text-blue-600",
    "Need driver": "bg-rose-50 text-rose-600",
    Cancelled: "bg-red-50 text-red-600",
  };
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-1 leading-5 text-foreground">{value}</dd>
    </div>
  );
}

function PageButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted hover:text-primary [&_svg]:size-4"
      type="button"
    >
      {children}
    </button>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 size-3.5 -translate-y-1/2 text-brand-icon"
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
