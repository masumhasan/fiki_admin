"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Repeat2,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  getAdminTripsApi,
  getAdminDriversApi,
  assignDriverApi,
  deleteTripApi,
} from "@/lib/api";

type RequestStatus =
  | "Pending"
  | "Approved"
  | "Need driver"
  | "Completed"
  | "Rejected"
  | "Scheduled";

type RideRequest = {
  id: string;
  rawId: string;
  passenger: string;
  phone: string;
  initials: string;
  avatar: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  recurring?: string;
  roundTrip: boolean;
  driver?: string;
  status: RequestStatus;
  backendStatus?: string;
  quotedFare?: number;
  counterOffer?: number;
  timestamp?: number;
};

const tabs = [
  "All",
  "Pending",
  "Approved",
  "Need driver",
  "Completed",
  "Rejected",
] as const;

export function RideRequestsPage({ hideHeader }: { hideHeader?: boolean }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [trips, setTrips] = useState<RideRequest[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ride request and all associated recurring trips? This action is permanent.")) {
      return;
    }
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) return;
    const res = await deleteTripApi(token, id);
    if (res.success) {
      fetchTripsAndDrivers();
    } else {
      alert(res.error?.message || "Failed to delete ride request");
    }
  };

  const fetchTripsAndDrivers = async () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [tripsRes, driversRes] = await Promise.all([
        getAdminTripsApi(token, 1, 1000, undefined, "requests"),
        getAdminDriversApi(token),
      ]);

      if (
        tripsRes.success &&
        tripsRes.data &&
        Array.isArray(tripsRes.data.trips)
      ) {
        const mapped: RideRequest[] = tripsRes.data.trips.map((t: any) => {
          const passengerName = t.passengerId?.name || "Passenger";
          const driverName = t.driverId?.name;

          let statusStr: RequestStatus = "Pending";
          if (t.status === "COMPLETED") statusStr = "Completed";
          else if (t.status === "CANCELLED" || t.status === "QUOTE_DENIED")
            statusStr = "Rejected";
          else if (t.status === "QUOTE_SENT") statusStr = "Approved";
          else if (
            t.status === "ACCEPTED" ||
            t.status === "DRIVER_ARRIVING" ||
            t.status === "DRIVER_ARRIVED"
          )
            statusStr = "Approved";
          else if (t.status === "IN_PROGRESS") statusStr = "Scheduled";
          else if (t.status === "QUOTE_COUNTERED") statusStr = "Pending";
          else if (t.status === "QUOTE_ACCEPTED") statusStr = "Need driver";
          else if (t.status === "REQUESTED")
            statusStr = driverName ? "Approved" : "Need driver";

          const isRecurring =
            t.schedule === "recurring" ||
            t.tripType === "recurring" ||
            (Array.isArray(t.recurringDays) && t.recurringDays.length > 0);
          const isRoundTrip =
            t.tripType === "round-trip" ||
            t.tripType === "round_trip" ||
            t.isRoundTrip === true;

          let recurringText = "";
          if (isRecurring) {
            if (Array.isArray(t.recurringDays) && t.recurringDays.length > 0) {
              recurringText = t.recurringDays
                .map((d: string) => d.substring(0, 3))
                .join(", ");
            } else {
              recurringText = "Yes";
            }
          }

          return {
            id: `RR-${t._id.substring(t._id.length - 4).toUpperCase()}`,
            rawId: t._id,
            passenger: passengerName,
            phone: t.passengerId?.phone || "—",
            initials:
              passengerName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2) || "PA",
            avatar: "bg-violet-600",
            pickup: t.pickupLocation?.address || "—",
            destination: t.dropoffLocation?.address || "—",
            date: t.scheduledTime
              ? new Date(t.scheduledTime).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "America/Chicago",
                })
              : t.createdAt
                ? new Date(t.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "America/Chicago",
                  })
                : "—",
            time: t.scheduledTime
              ? new Date(t.scheduledTime).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "America/Chicago",
                })
              : t.createdAt
                ? new Date(t.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "America/Chicago",
                  })
                : "—",
            recurring: recurringText || undefined,
            roundTrip: isRoundTrip,
            driver: driverName,
            status: statusStr,
            backendStatus: t.status,
            quotedFare: t.quotedFare,
            counterOffer: t.counterOffer,
            timestamp: new Date(t.createdAt || t.scheduledTime || t.startDate || 0).getTime(),
          };
        });

        mapped.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setTrips(mapped);
      } else {
        setTrips([]);
      }

      if (
        driversRes.success &&
        driversRes.data &&
        Array.isArray(driversRes.data.drivers)
      ) {
        setAvailableDrivers(driversRes.data.drivers);
      }
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsAndDrivers();
  }, []);

  const handleAssignDriver = async (tripId: string) => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) return;
    const targetDriver = availableDrivers[0];
    if (!targetDriver) return;
    const res = await assignDriverApi(token, tripId, targetDriver._id);
    if (res.success) {
      await fetchTripsAndDrivers();
    }
  };

  const tripsWithHandler = trips.map((req) => ({
    ...req,
    onAssign: handleAssignDriver,
  }));

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tripsWithHandler.filter((request) => {
      const matchesTab = activeTab === "All" || request.status === activeTab;
      const matchesQuery =
        !normalized ||
        [
          request.id,
          request.passenger,
          request.pickup,
          request.destination,
        ].some((value) => value.toLowerCase().includes(normalized));
      return matchesTab && matchesQuery;
    });
  }, [tripsWithHandler, activeTab, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleRequests = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="space-y-5">
      {!hideHeader && (
        <PageHeader
          title="Ride Requests"
          description="Review, approve and manage passenger ride requests."
        />
      )}

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_6px_22px_rgba(8,37,82,0.06)]">
        <div className="flex flex-col-reverse gap-3 border-b border-border px-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => {
                const count =
                  tab === "All"
                    ? trips.length
                    : trips.filter((r) => r.status === tab).length;
                return (
                  <button
                    className={`relative -mb-px flex h-10 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setPage(1);
                    }}
                    type="button"
                  >
                    {tab}
                    <span
                      className={`grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] leading-4 ${activeTab === tab ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      {loading ? "…" : count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="relative w-full py-3 sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-icon" />
            <input
              className="h-10 w-full rounded-lg border border-input bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary focus:bg-card"
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search requests..."
              type="search"
              value={query}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary/50" />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-286 table-fixed text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/55 text-[11px] font-bold text-muted-foreground">
                    <th className="w-14 px-4 py-3.5">SL</th>
                    <th className="w-20 py-3.5">Request ID</th>
                    <th className="w-36 py-3.5">Passenger</th>
                    <th className="w-36 py-3.5">Pickup</th>
                    <th className="w-36 py-3.5">Destination</th>
                    <th className="w-28 py-3.5">Date</th>
                    <th className="w-24 py-3.5">Recurring</th>
                    <th className="w-22 py-3.5">Round trip</th>
                    <th className="w-32 py-3.5">Assigned driver</th>
                    <th className="w-24 py-3.5">Status</th>
                    <th className="w-16 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRequests.map((request, index) => (
                    <RequestRow
                      key={request.rawId}
                      serial={(page - 1) * pageSize + index + 1}
                      request={{
                        ...request,
                        onDelete: handleDeleteRequest,
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border lg:hidden">
              {visibleRequests.map((request, index) => (
                <RequestCard
                  key={request.rawId}
                  serial={(page - 1) * pageSize + index + 1}
                  request={{
                    ...request,
                    onDelete: handleDeleteRequest,
                  }}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="px-5 py-16 text-center">
                <Search className="mx-auto size-8 text-brand-soft" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {trips.length === 0
                    ? "No ride requests yet"
                    : "No requests match your search"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {trips.length === 0
                    ? "Ride requests from passengers will appear here."
                    : "Try changing the status or search term."}
                </p>
              </div>
            )}
          </>
        )}

        <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Rows{" "}
              <select
                className="h-9 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-foreground"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
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
                {filtered.length ? (page - 1) * pageSize + 1 : 0}–
                {Math.min(page * pageSize, filtered.length)}
              </strong>{" "}
              of {filtered.length} requests
            </p>
          </div>
          <nav aria-label="Pagination" className="flex items-center gap-1.5">
            <PageButton
              label="Previous page"
              disabled={page === 1}
              onClick={() => setPage((v) => Math.max(1, v - 1))}
            >
              <ChevronLeft />
            </PageButton>
            {pageCount <= 7 ? (
              Array.from({ length: pageCount }, (_, i) => i + 1).map((v) => (
                <button
                  className={`grid size-9 place-items-center rounded-lg text-xs font-bold ${page === v ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}
                  key={v}
                  onClick={() => setPage(v)}
                  type="button"
                >
                  {v}
                </button>
              ))
            ) : (
              <>
                {[1, 2].map((v) => (
                  <button
                    key={v}
                    onClick={() => setPage(v)}
                    className={`grid size-9 place-items-center rounded-lg text-xs font-bold ${page === v ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}
                    type="button"
                  >
                    {v}
                  </button>
                ))}
                {page > 3 && <span className="px-1 text-xs text-muted-foreground">...</span>}
                {page > 2 && page < pageCount - 1 && (
                  <button
                    onClick={() => setPage(page)}
                    className="grid size-9 place-items-center rounded-lg text-xs font-bold bg-primary text-primary-foreground"
                    type="button"
                  >
                    {page}
                  </button>
                )}
                {page < pageCount - 2 && <span className="px-1 text-xs text-muted-foreground">...</span>}
                {[pageCount - 1, pageCount].map((v) => (
                  <button
                    key={v}
                    onClick={() => setPage(v)}
                    className={`grid size-9 place-items-center rounded-lg text-xs font-bold ${page === v ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}
                    type="button"
                  >
                    {v}
                  </button>
                ))}
              </>
            )}
            <PageButton
              label="Next page"
              disabled={page === pageCount || pageCount === 0}
              onClick={() => setPage((v) => Math.min(pageCount, v + 1))}
            >
              <ChevronRight />
            </PageButton>
          </nav>
        </footer>
      </section>
    </div>
  );
}

function RequestRow({
  serial,
  request,
}: {
  serial: number;
  request: RideRequest & { onAssign?: (id: string) => void; onDelete?: (id: string) => void };
}) {
  return (
    <tr className="border-b border-border/80 text-xs last:border-0 hover:bg-muted/35">
      <td className="px-4 py-4 font-semibold text-muted-foreground">
        {serial}
      </td>
      <td className="py-4 font-bold text-primary">{request.id}</td>
      <td className="py-4">
        <Passenger request={request} />
      </td>
      <td
        className="truncate pr-4 text-muted-foreground"
        title={request.pickup}
      >
        {request.pickup}
      </td>
      <td
        className="truncate pr-4 text-muted-foreground"
        title={request.destination}
      >
        {request.destination}
      </td>
      <td className="py-4">
        <strong className="block font-semibold text-foreground">
          {request.date}
        </strong>
        <span className="mt-1 block text-muted-foreground">{request.time}</span>
      </td>
      <td className="py-4">
        {request.recurring ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
            <Repeat2 className="size-3" />
            {request.recurring}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            No
          </span>
        )}
      </td>
      <td className="py-4">
        {request.roundTrip ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <Check className="size-3" /> Yes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            No
          </span>
        )}
      </td>
      <td className="py-4">
        {request.driver ? (
          <span className="font-medium text-foreground">{request.driver}</span>
        ) : (
          <button
            className="inline-flex items-center gap-1 font-bold text-brand-yellow-hover"
            type="button"
            onClick={() => request.onAssign?.(request.rawId)}
          >
            <UserPlus className="size-3.5" />
            Assign
          </button>
        )}
      </td>
      <td className="py-4">
        <StatusBadge status={request.status} />
      </td>
      <td className="py-4 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <Link
            aria-label={`View ${request.id}`}
            className="inline-grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/30 hover:bg-muted hover:text-primary cursor-pointer"
            href={`/ride-requests/${request.rawId || request.id}`}
          >
            <Eye className="size-4" />
          </Link>
          <button
            type="button"
            aria-label={`Delete ${request.id}`}
            onClick={() => request.onDelete?.(request.rawId || request.id)}
            className="inline-grid size-8 place-items-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700 cursor-pointer"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function RequestCard({
  serial,
  request,
}: {
  serial: number;
  request: RideRequest & { onDelete?: (id: string) => void };
}) {
  return (
    <article className="p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-6 shrink-0 place-items-center rounded bg-muted text-xs font-bold text-muted-foreground">
          {serial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="text-xs text-primary">{request.id}</strong>
            <StatusBadge status={request.status} />
          </div>
          <div className="mt-3">
            <Passenger request={request} />
          </div>
        </div>
      </div>
      <dl className="ml-7 mt-4 grid gap-3 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-muted-foreground">Pickup</dt>
          <dd className="mt-1 text-foreground">{request.pickup}</dd>
        </div>
        <div>
          <dt className="font-semibold text-muted-foreground">Destination</dt>
          <dd className="mt-1 text-foreground">{request.destination}</dd>
        </div>
        <div>
          <dt className="font-semibold text-muted-foreground">Schedule</dt>
          <dd className="mt-1 text-foreground">
            {request.date} · {request.time}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-muted-foreground">Driver</dt>
          <dd className="mt-1 text-foreground">
            {request.driver ?? "Not assigned"}
          </dd>
        </div>
      </dl>
      <div className="ml-7 mt-4 flex items-center gap-2">
        <Link
          className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-bold text-primary hover:bg-muted"
          href={`/ride-requests/${(request as any).rawId || request.id}`}
        >
          <Eye className="size-3.5" />
          View details
        </Link>
        <button
          type="button"
          onClick={() => request.onDelete?.((request as any).rawId || request.id)}
          className="flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-600 hover:bg-red-100 cursor-pointer"
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
        {!request.driver ? (
          <button
            className="flex h-9 items-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-bold text-secondary-foreground"
            type="button"
          >
            <UserPlus className="size-3.5" />
            Assign driver
          </button>
        ) : null}
      </div>
    </article>
  );
}

function Passenger({ request }: { request: RideRequest }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${request.avatar}`}
      >
        {request.initials}
      </span>
      <span className="min-w-0">
        <strong className="block truncate text-[13px] text-foreground">
          {request.passenger}
        </strong>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">
          {request.phone}
        </span>
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const styles: Record<RequestStatus, string> = {
    Pending: "bg-amber-50 text-amber-700",
    Approved: "bg-emerald-50 text-emerald-700",
    "Need driver": "bg-rose-50 text-rose-600",
    Completed: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-600",
    Scheduled: "bg-blue-50 text-blue-600",
  };
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function PageButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted hover:text-primary disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4"
      type="button"
    >
      {children}
    </button>
  );
}
