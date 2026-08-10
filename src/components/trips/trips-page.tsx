"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";

type TripStatus =
  | "Onboard"
  | "Completed"
  | "Scheduled"
  | "Need driver"
  | "Cancelled";

type Trip = {
  id: string;
  passenger: string;
  initials: string;
  avatar: string;
  driver?: string;
  pickup: string;
  destination: string;
  status: TripStatus;
  time: string;
  date: "Today" | "Yesterday" | "Tomorrow";
};

const trips: Trip[] = [
  {
    id: "T-0391",
    passenger: "Sarah Johnson",
    initials: "SJ",
    avatar: "bg-violet-600",
    driver: "Marcus Williams",
    pickup: "123 Oak Avenue",
    destination: "City Medical Center",
    status: "Onboard",
    time: "9:00 AM",
    date: "Today",
  },
  {
    id: "T-0390",
    passenger: "James Chen",
    initials: "JC",
    avatar: "bg-blue-600",
    driver: "Aisha Patel",
    pickup: "45 Maple Street",
    destination: "Downtown Terminal",
    status: "Completed",
    time: "7:30 AM",
    date: "Today",
  },
  {
    id: "T-0389",
    passenger: "Maria Rodriguez",
    initials: "MR",
    avatar: "bg-red-500",
    driver: "Robert Thompson",
    pickup: "78 Pine Road",
    destination: "Westside Mall",
    status: "Scheduled",
    time: "11:00 AM",
    date: "Today",
  },
  {
    id: "T-0388",
    passenger: "David Kim",
    initials: "DK",
    avatar: "bg-cyan-600",
    driver: "Linda Chen",
    pickup: "156 Elm Street",
    destination: "Central Library",
    status: "Completed",
    time: "2:00 PM",
    date: "Yesterday",
  },
  {
    id: "T-0387",
    passenger: "Emma Thompson",
    initials: "ET",
    avatar: "bg-emerald-600",
    pickup: "220 Birch Ave",
    destination: "Airport Terminal 2",
    status: "Need driver",
    time: "5:30 AM",
    date: "Today",
  },
  {
    id: "T-0386",
    passenger: "Robert Park",
    initials: "RP",
    avatar: "bg-amber-600",
    driver: "James Morrison",
    pickup: "34 Willow Lane",
    destination: "Veterans Medical",
    status: "Scheduled",
    time: "10:00 AM",
    date: "Tomorrow",
  },
  {
    id: "T-0385",
    passenger: "Patricia Lee",
    initials: "PL",
    avatar: "bg-pink-600",
    driver: "Marcus Williams",
    pickup: "88 Cedar Court",
    destination: "City Hall",
    status: "Cancelled",
    time: "8:45 AM",
    date: "Yesterday",
  },
  {
    id: "T-0384",
    passenger: "Thomas Wright",
    initials: "TW",
    avatar: "bg-indigo-600",
    driver: "Aisha Patel",
    pickup: "12 Poplar Ave",
    destination: "Sports Complex",
    status: "Completed",
    time: "3:00 PM",
    date: "Yesterday",
  },
];

const summary = [
  { label: "Total trips", value: trips.length, tone: "text-primary" },
  {
    label: "Onboard now",
    value: trips.filter((trip) => trip.status === "Onboard").length,
    tone: "text-emerald-500",
  },
  {
    label: "Need driver",
    value: trips.filter((trip) => trip.status === "Need driver").length,
    tone: "text-red-500",
  },
  {
    label: "Completed today",
    value: trips.filter(
      (trip) => trip.status === "Completed" && trip.date === "Today",
    ).length,
    tone: "text-blue-500",
  },
];

const filters = [
  "All statuses",
  "Onboard",
  "Scheduled",
  "Completed",
  "Need driver",
  "Cancelled",
] as const;

export function TripsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] =
    useState<(typeof filters)[number]>("All statuses");
  const [pageSize, setPageSize] = useState("10");

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
  }, [query, status]);

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
        row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","),
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
              {item.value}
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
              {filtered.map((trip) => (
                <TripRow key={trip.id} trip={trip} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-border lg:hidden">
          {filtered.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Search className="mx-auto size-8 text-brand-soft" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              No trips found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try another search or status filter.
            </p>
          </div>
        ) : null}

        <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Rows{" "}
              <select
                className="h-9 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-foreground"
                value={pageSize}
                onChange={(event) => setPageSize(event.target.value)}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </label>
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <strong className="text-foreground">{filtered.length}</strong> of{" "}
              {trips.length} trips
            </p>
          </div>
          <nav aria-label="Pagination" className="flex items-center gap-1.5">
            <PageButton label="Previous page">
              <ChevronLeft />
            </PageButton>
            <button
              className="grid size-9 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground"
              type="button"
            >
              1
            </button>
            <button
              className="grid size-9 place-items-center rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
              type="button"
            >
              2
            </button>
            <button
              className="grid size-9 place-items-center rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted"
              type="button"
            >
              3
            </button>
            <PageButton label="Next page">
              <ChevronRight />
            </PageButton>
          </nav>
        </footer>
      </section>
    </div>
  );
}

function TripRow({ trip }: { trip: Trip }) {
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
            className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/30 hover:bg-muted hover:text-primary [&_svg]:size-4"
            href={`/trips/${trip.id}`}
          >
            <Eye />
          </Link>
        </div>
      </td>
    </tr>
  );
}

function TripCard({ trip }: { trip: Trip }) {
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
          href={`/trips/${trip.id}`}
        >
          <Eye className="size-3.5" />
          View
        </Link>
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
