"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Repeat2,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";

type RequestStatus =
  | "Pending"
  | "Approved"
  | "Need driver"
  | "Completed"
  | "Rejected"
  | "Scheduled";

type RideRequest = {
  id: string;
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
};

const requests: RideRequest[] = [
  {
    id: "RR-2847",
    passenger: "Sarah Johnson",
    phone: "(555) 234-5678",
    initials: "SJ",
    avatar: "bg-violet-600",
    pickup: "123 Oak Avenue, District 7",
    destination: "City Medical Center, Block B",
    date: "Jul 16, 2026",
    time: "9:00 AM",
    recurring: "Weekly",
    roundTrip: true,
    status: "Pending",
  },
  {
    id: "RR-2846",
    passenger: "James Chen",
    phone: "(555) 345-6789",
    initials: "JC",
    avatar: "bg-blue-600",
    pickup: "45 Maple Street, Unit 3",
    destination: "Downtown Bus Terminal",
    date: "Jul 16, 2026",
    time: "7:30 AM",
    recurring: "Daily",
    roundTrip: false,
    driver: "Marcus Williams",
    status: "Approved",
  },
  {
    id: "RR-2845",
    passenger: "Maria Rodriguez",
    phone: "(555) 456-7890",
    initials: "MR",
    avatar: "bg-red-500",
    pickup: "78 Pine Road, Apt 12",
    destination: "Westside Shopping Center",
    date: "Jul 17, 2026",
    time: "11:00 AM",
    roundTrip: true,
    status: "Need driver",
  },
  {
    id: "RR-2844",
    passenger: "David Kim",
    phone: "(555) 567-8901",
    initials: "DK",
    avatar: "bg-cyan-600",
    pickup: "156 Elm Street",
    destination: "Central Library",
    date: "Jul 15, 2026",
    time: "2:00 PM",
    recurring: "Monthly",
    roundTrip: false,
    driver: "Aisha Patel",
    status: "Completed",
  },
  {
    id: "RR-2843",
    passenger: "Emma Thompson",
    phone: "(555) 678-9012",
    initials: "ET",
    avatar: "bg-emerald-600",
    pickup: "220 Birch Ave, Suite 5",
    destination: "Airport Terminal 2",
    date: "Jul 15, 2026",
    time: "5:30 AM",
    roundTrip: false,
    status: "Rejected",
  },
  {
    id: "RR-2842",
    passenger: "Robert Park",
    phone: "(555) 789-0123",
    initials: "RP",
    avatar: "bg-amber-600",
    pickup: "34 Willow Lane",
    destination: "Veterans Medical Center",
    date: "Jul 18, 2026",
    time: "10:00 AM",
    recurring: "Weekly",
    roundTrip: true,
    driver: "Linda Chen",
    status: "Approved",
  },
  {
    id: "RR-2841",
    passenger: "Patricia Lee",
    phone: "(555) 890-1234",
    initials: "PL",
    avatar: "bg-pink-600",
    pickup: "88 Cedar Court",
    destination: "City Hall",
    date: "Jul 18, 2026",
    time: "8:45 AM",
    roundTrip: false,
    status: "Pending",
  },
  {
    id: "RR-2840",
    passenger: "Thomas Wright",
    phone: "(555) 901-2345",
    initials: "TW",
    avatar: "bg-indigo-600",
    pickup: "12 Poplar Ave",
    destination: "Sports Complex",
    date: "Jul 19, 2026",
    time: "3:00 PM",
    recurring: "Daily",
    roundTrip: false,
    driver: "Robert Thompson",
    status: "Scheduled",
  },
];

const tabs = [
  "All",
  "Pending",
  "Approved",
  "Need driver",
  "Completed",
  "Rejected",
] as const;

import { useEffect } from "react";
import { getAdminTripsApi, getAdminDriversApi, assignDriverApi } from "@/lib/api";

export function RideRequestsPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [liveTrips, setLiveTrips] = useState<RideRequest[] | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);

  const fetchTripsAndDrivers = () => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      if (token) {
        getAdminTripsApi(token).then((res) => {
          if (res.success && res.data && Array.isArray(res.data.trips)) {
            const mapped: RideRequest[] = res.data.trips.map((t: any) => {
              const passengerName = t.passengerId?.name || "Passenger";
              const driverName = t.driverId?.name;

              let statusStr: RequestStatus = "Pending";
              if (t.status === "COMPLETED") statusStr = "Completed";
              else if (t.status === "QUOTE_ACCEPTED") statusStr = "Need driver";
              else if (t.status === "QUOTE_DENIED" || t.status === "CANCELLED") statusStr = "Rejected";
              else if (t.status === "QUOTE_SENT") statusStr = "Approved";
              else if (t.status === "ACCEPTED" || t.status === "DRIVER_ARRIVING" || t.status === "DRIVER_ARRIVED") statusStr = "Approved";
              else if (t.status === "IN_PROGRESS") statusStr = "Scheduled";
              else if (t.status === "QUOTE_COUNTERED") statusStr = "Pending";
              else if (t.status === "REQUESTED") statusStr = driverName ? "Approved" : "Pending";

              return {
                id: `RR-${t._id.substring(t._id.length - 4).toUpperCase()}`,
                rawId: t._id,
                passenger: passengerName,
                phone: t.passengerId?.phone || "(555) 000-0000",
                initials: passengerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "PA",
                avatar: "bg-violet-600",
                pickup: t.pickupLocation?.address || "Pickup Address",
                destination: t.dropoffLocation?.address || "Dropoff Address",
                date: t.scheduledTime
                  ? new Date(t.scheduledTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
                time: t.scheduledTime
                  ? new Date(t.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
                roundTrip: false,
                driver: driverName,
                status: statusStr,
                backendStatus: t.status,
                quotedFare: t.quotedFare,
                counterOffer: t.counterOffer,
              };
            });
            setLiveTrips(mapped);
          }
        });

        getAdminDriversApi(token).then((res) => {
          if (res.success && res.data && Array.isArray(res.data.drivers)) {
            setAvailableDrivers(res.data.drivers);
          }
        });
      }
    }
  };

  useEffect(() => {
    fetchTripsAndDrivers();
  }, []);

  const handleAssignDriver = async (tripId: string) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      if (token) {
        // Pick first available driver or default
        const targetDriver = availableDrivers[0];
        const driverId = targetDriver ? targetDriver._id : "6a797c271e262a8ed9ae2b25";
        const res = await assignDriverApi(token, tripId, driverId);
        if (res.success) {
          fetchTripsAndDrivers();
        }
      }
    }
  };

  const activeRequestsList = (liveTrips || requests).map((req: any) => ({
    ...req,
    onAssign: handleAssignDriver,
  }));

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return activeRequestsList.filter((request) => {
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
  }, [activeRequestsList, activeTab, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleRequests = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ride Requests"
        description="Review, approve and manage passenger ride requests."
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_6px_22px_rgba(8,37,82,0.06)]">
        <div className="flex flex-col-reverse gap-3 border-b border-border px-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => {
                const dataSource = liveTrips || requests;
                const count =
                  tab === "All"
                    ? dataSource.length
                    : dataSource.filter((request) => request.status === tab)
                        .length;
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
                      {count}
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
                  key={request.id}
                  serial={(page - 1) * pageSize + index + 1}
                  request={request}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-border lg:hidden">
          {visibleRequests.map((request, index) => (
            <RequestCard
              key={request.id}
              serial={(page - 1) * pageSize + index + 1}
              request={request}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Search className="mx-auto size-8 text-brand-soft" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              No requests found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try changing the status or search term.
            </p>
          </div>
        ) : null}

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
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft />
            </PageButton>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (value) => (
                <button
                  className={`grid size-9 place-items-center rounded-lg text-xs font-bold ${page === value ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}
                  key={value}
                  onClick={() => setPage(value)}
                  type="button"
                >
                  {value}
                </button>
              ),
            )}
            <PageButton
              label="Next page"
              disabled={page === pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
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
  request: RideRequest;
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
          <span className="inline-flex items-center gap-1 text-blue-500">
            <Repeat2 className="size-3.5" />
            {request.recurring}
          </span>
        ) : (
          <span className="text-brand-soft">—</span>
        )}
      </td>
      <td className="py-4">
        {request.roundTrip ? (
          <Check className="size-4 text-emerald-500" />
        ) : (
          <X className="size-4 text-brand-soft" />
        )}
      </td>
      <td className="py-4">
        {request.driver ? (
          <span className="font-medium text-foreground">{request.driver}</span>
        ) : (
          <button
            className="inline-flex items-center gap-1 font-bold text-brand-yellow-hover"
            type="button"
            onClick={() => (request as any).onAssign?.((request as any).rawId)}
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
        <Link
          aria-label={`View ${request.id}`}
          className="inline-grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/30 hover:bg-muted hover:text-primary"
          href={`/ride-requests/${(request as any).rawId || request.id}`}
        >
          <Eye className="size-4" />
        </Link>
      </td>
    </tr>
  );
}

function RequestCard({
  serial,
  request,
}: {
  serial: number;
  request: RideRequest;
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
