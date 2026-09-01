"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { getAdminTripsApi, deleteTripApi } from "@/lib/api";
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
  driver?: string;
  pickup: string;
  destination: string;
  status: TripStatus;
  time: string;
  date: string;
};

const filters = [
  "All statuses",
  "Onboard",
  "Scheduled",
  "Completed",
  "Need driver",
  "Cancelled",
] as const;

export function TripsPage({ hideHeader }: { hideHeader?: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] =
    useState<(typeof filters)[number]>("All statuses");
  const [pageSize, setPageSize] = useState("10");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      const res = await getAdminTripsApi(token, 1, 1000, undefined, "trips");
      if (res.success && res.data && Array.isArray(res.data.trips)) {
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
          const passName = t.passengerId?.name || "Passenger";
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
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "America/Chicago",
              })
            : (t.createdAt
                ? new Date(t.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "America/Chicago",
                  })
                : "—");
          const timeStr = t.pickupTime
            ? t.pickupTime
            : (t.createdAt
                ? new Date(t.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "America/Chicago",
                  })
                : "—");

          return {
            id: `TRP-${t._id.substring(t._id.length - 4).toUpperCase()}`,
            mongoId: t._id,
            passenger: passName,
            initials,
            avatar: "bg-violet-600",
            driver: driverName,
            pickup: t.pickupLocation?.address || "—",
            destination: t.dropoffLocation?.address || "—",
            status: statusVal,
            time: timeStr,
            date: dateStr,
          };
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
  }, []);

  const summary = [
    { label: "Total trips", value: trips.length, tone: "text-primary" },
    {
      label: "Onboard now",
      value: trips.filter((t) => t.status === "Onboard").length,
      tone: "text-emerald-500",
    },
    {
      label: "Need driver",
      value: trips.filter((t) => t.status === "Need driver").length,
      tone: "text-red-500",
    },
    {
      label: "Completed",
      value: trips.filter((t) => t.status === "Completed").length,
      tone: "text-blue-500",
    },
  ];

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return trips.filter((trip) => {
      const matchesStatus = status === "All statuses" || trip.status === status;
      const matchesQuery =
        !normalized ||
        [
          trip.id,
          trip.passenger,
          trip.driver ?? "",
          trip.pickup,
          trip.destination,
        ].some((value) => value.toLowerCase().includes(normalized));
      return matchesStatus && matchesQuery;
    });
  }, [trips, query, status]);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, status, pageSize]);

  const pageSizeNum = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeNum));
  const startIndex = (currentPage - 1) * pageSizeNum;
  const endIndex = Math.min(startIndex + pageSizeNum, filtered.length);
  const visibleTrips = useMemo(
    () => filtered.slice(startIndex, startIndex + pageSizeNum),
    [filtered, startIndex, pageSizeNum],
  );

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
      ...filtered.map((trip) => [
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
        <header className="flex flex-col gap-3 border-b border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative sm:mr-auto sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-icon" />
              <input
                className="h-10 w-full rounded-lg border border-input bg-muted pl-11 pr-4 text-sm outline-none placeholder:text-brand-placeholder focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search trips..."
                type="search"
                value={query}
              />
            </div>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-icon" />
              <select
                aria-label="Filter trips by status"
                className="h-10 w-full appearance-none rounded-lg border border-input bg-card pl-11 pr-9 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 sm:w-44"
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
          </div>
        </header>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary/50" />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-270 table-fixed text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/55 text-[11px] font-bold text-muted-foreground">
                    <th className="w-20 px-5 py-3.5">Trip ID</th>
                    <th className="w-40 py-3.5">Passenger</th>
                    <th className="w-36 py-3.5">Driver</th>
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
                    <TripRow key={trip.mongoId} trip={trip} onDelete={handleDeleteTrip} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border lg:hidden">
              {visibleTrips.map((trip) => (
                <TripCard key={trip.mongoId} trip={trip} onDelete={handleDeleteTrip} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="px-5 py-16 text-center">
                <Search className="mx-auto size-8 text-brand-soft" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {trips.length === 0
                    ? "No trips recorded yet"
                    : "No trips match your search"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {trips.length === 0
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
                {filtered.length === 0 ? 0 : startIndex + 1}
              </strong>{" "}
              to <strong className="text-foreground">{endIndex}</strong> of{" "}
              <strong className="text-foreground">{filtered.length}</strong>{" "}
              trips
            </p>
          </div>
          <nav aria-label="Pagination" className="flex items-center gap-1.5">
            <button
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
              disabled={currentPage === totalPages || totalPages === 0 || filtered.length === 0}
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

function TripRow({ trip, onDelete }: { trip: Trip; onDelete?: (id: string) => void }) {
  return (
    <tr className="border-b border-border/80 text-xs last:border-0 hover:bg-muted/35">
      <td className="px-5 py-4 font-bold text-primary">{trip.id}</td>
      <td className="py-4">
        <Passenger trip={trip} />
      </td>
      <td className="truncate pr-3 font-medium text-foreground">
        {trip.driver ?? <span className="text-brand-soft">— Unassigned</span>}
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
            href={`/ride-requests/${trip.mongoId || trip.id}`}
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

function TripCard({ trip, onDelete }: { trip: Trip; onDelete?: (id: string) => void }) {
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
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
        <Info label="Driver" value={trip.driver ?? "Unassigned"} />
        <Info label="Schedule" value={`${trip.date} · ${trip.time}`} />
        <Info label="Pickup" value={trip.pickup} />
        <Info label="Destination" value={trip.destination} />
      </dl>
      <div className="mt-4 flex gap-2">
        <Link
          className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-bold text-primary hover:bg-muted"
          href={`/ride-requests/${trip.mongoId || trip.id}`}
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
        className={`grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${trip.avatar}`}
      >
        {trip.initials}
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
