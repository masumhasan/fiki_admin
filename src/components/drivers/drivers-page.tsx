"use client";

import {
  Activity,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileCheck2,
  Mail,
  Phone,
  Search,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";

type DriverStatus = "Active" | "On trip" | "Off duty";

type Driver = {
  id: string;
  name: string;
  initials: string;
  avatar: string;
  joined: string;
  status: DriverStatus;
  vehicle: string;
  plate: string;
  phone: string;
  trips: number;
  rating: string;
};

const drivers: Driver[] = [
  {
    id: "D-001",
    name: "Marcus Williams",
    initials: "MW",
    avatar: "bg-primary",
    joined: "Mar 2024",
    status: "Active",
    vehicle: "Toyota Sienna",
    plate: "FKT-1234",
    phone: "(555) 123-4567",
    trips: 24,
    rating: "4.9",
  },
  {
    id: "D-002",
    name: "Aisha Patel",
    initials: "AP",
    avatar: "bg-violet-600",
    joined: "Jan 2024",
    status: "Active",
    vehicle: "Honda Odyssey",
    plate: "FKT-2345",
    phone: "(555) 234-5678",
    trips: 21,
    rating: "4.8",
  },
  {
    id: "D-003",
    name: "Robert Thompson",
    initials: "RT",
    avatar: "bg-blue-600",
    joined: "Jun 2024",
    status: "On trip",
    vehicle: "Ford Transit",
    plate: "FKT-3456",
    phone: "(555) 345-6789",
    trips: 18,
    rating: "4.7",
  },
  {
    id: "D-004",
    name: "Linda Chen",
    initials: "LC",
    avatar: "bg-red-500",
    joined: "Feb 2024",
    status: "Active",
    vehicle: "Dodge Grand Caravan",
    plate: "FKT-4567",
    phone: "(555) 456-7890",
    trips: 22,
    rating: "4.9",
  },
  {
    id: "D-005",
    name: "James Morrison",
    initials: "JM",
    avatar: "bg-cyan-600",
    joined: "Apr 2024",
    status: "Off duty",
    vehicle: "Toyota Highlander",
    plate: "FKT-5678",
    phone: "(555) 567-8901",
    trips: 19,
    rating: "4.6",
  },
];

const applications = [
  {
    id: "APP-2024-001",
    name: "Marcus Johnson",
    phone: "(305) 847-2291",
    email: "marcus.johnson@gmail.com",
    type: "Ambulatory",
    license: "CDL-A F3847291",
    start: "Jan 15, 2025",
    background: "Cleared",
    submitted: "Dec 28, 2024",
    status: "Pending review",
  },
  {
    id: "APP-2024-007",
    name: "Robert Okafor",
    phone: "(954) 772-3349",
    email: "r.okafor@gmail.com",
    type: "Ambulatory",
    license: "CDL-A R8812738",
    start: "Jan 28, 2025",
    background: "Cleared",
    submitted: "Dec 8, 2024",
    status: "Pending review",
  },
  {
    id: "APP-2024-003",
    name: "David Chen",
    phone: "(954) 221-7784",
    email: "dchen1987@yahoo.com",
    type: "Ambulatory",
    license: "CDL-A D1029384",
    start: "Jan 20, 2025",
    background: "Pending",
    submitted: "Dec 20, 2024",
    status: "Interview scheduled",
  },
  {
    id: "APP-2024-004",
    name: "Emily Rodriguez",
    phone: "(561) 903-4421",
    email: "emily.r@gmail.com",
    type: "Wheelchair",
    license: "CDL-B E8831029",
    start: "Mar 1, 2025",
    background: "Failed",
    submitted: "Dec 18, 2024",
    status: "Rejected",
  },
  {
    id: "APP-2024-006",
    name: "Lisa Park",
    phone: "(786) 441-2210",
    email: "lisa.park@hotmail.com",
    type: "Wheelchair",
    license: "CDL-B L5512987",
    start: "Feb 15, 2025",
    background: "Pending",
    submitted: "Dec 10, 2024",
    status: "Missing docs",
  },
];

import { useEffect } from "react";
import { getAdminDriversApi } from "@/lib/api";

export function DriversPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | DriverStatus>("All");
  const [liveDrivers, setLiveDrivers] = useState<Driver[] | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      if (token) {
        getAdminDriversApi(token).then((res) => {
          if (res.success && res.data && res.data.drivers) {
            const mapped: Driver[] = res.data.drivers.map((d: any, idx: number) => {
              const profile = d.profile || {};
              const statusMap: Record<string, DriverStatus> = {
                ONLINE: "Active",
                ASSIGNED: "On trip",
                OFFLINE: "Off duty",
                UNAVAILABLE: "Off duty",
              };
              const status = statusMap[profile.availabilityStatus] || "Active";
              const vehicleStr = profile.vehicle
                ? `${profile.vehicle.make || ""} ${profile.vehicle.model || ""}`.trim() || "Toyota Sienna"
                : "Toyota Sienna";
              const plateStr = profile.vehicle?.licensePlate || "FKT-1234";

              const nameParts = (d.name || "Driver").split(" ");
              const initials = nameParts.length >= 2
                ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                : (d.name || "DR").substring(0, 2).toUpperCase();

              return {
                id: `D-${String(idx + 1).padStart(3, "0")}`,
                name: d.name || "Driver",
                initials,
                avatar: "bg-primary",
                joined: d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Jan 2026",
                status,
                vehicle: vehicleStr,
                plate: plateStr,
                phone: d.phone || "(555) 000-0000",
                trips: profile.completedTripsCount || 0,
                rating: profile.rating ? String(profile.rating) : "5.0",
              };
            });
            if (mapped.length > 0) {
              setLiveDrivers(mapped);
            }
          }
        });
      }
    }
  }, []);

  const activeDriverList = liveDrivers || drivers;

  const filteredDrivers = useMemo(
    () =>
      activeDriverList.filter(
        (driver) =>
          (filter === "All" || driver.status === filter) &&
          [driver.name, driver.id, driver.vehicle, driver.plate].some((value) =>
            value.toLowerCase().includes(query.toLowerCase()),
          ),
      ),
    [activeDriverList, filter, query],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drivers"
        description={`${activeDriverList.length} registered drivers`}
        action={
          <Link
            className="flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-[#0d2c58]"
            href="/drivers/applications"
          >
            View new requests
          </Link>
        }
      />
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        <Summary
          label="Total drivers"
          value={activeDriverList.length}
          tone="text-primary"
        />
        <Summary
          label="Active now"
          value={activeDriverList.filter((item) => item.status === "Active").length}
          tone="text-emerald-500"
        />
        <Summary
          label="On trip"
          value={activeDriverList.filter((item) => item.status === "On trip").length}
          tone="text-blue-500"
        />
        <Summary
          label="Off duty"
          value={activeDriverList.filter((item) => item.status === "Off duty").length}
          tone="text-brand-placeholder"
        />
      </section>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-icon" />
          <input
            className="h-10 w-full rounded-lg border border-input bg-muted pl-11 pr-4 text-sm outline-none placeholder:text-brand-placeholder focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search driver, vehicle or plate..."
            value={query}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto sm:ml-auto">
          {(["All", "Active", "On trip", "Off duty"] as const).map((item) => (
            <button
              className={`h-9 whitespace-nowrap rounded-lg px-3 text-xs font-bold ${filter === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredDrivers.map((driver) => (
          <DriverCard driver={driver} key={driver.id} />
        ))}
      </section>
    </div>
  );
}

function Summary({
  label,
  tone,
  value,
}: {
  label: string;
  tone: string;
  value: number;
}) {
  return (
    <article className="rounded-xl border border-[#e1e6ee] bg-card p-5 shadow-[0_4px_14px_rgba(15,37,74,.04)]">
      <p className="text-xs font-semibold text-muted-foreground sm:text-sm">
        {label}
      </p>
      <p
        className={`mt-2 text-4xl font-bold leading-none tracking-[-.04em] ${tone}`}
      >
        {value}
      </p>
    </article>
  );
}

function DriverCard({ driver }: { driver: Driver }) {
  return (
    <article className="rounded-xl border border-[#e1e6ee] bg-card p-5 shadow-[0_4px_14px_rgba(15,37,74,.04)]">
      <div className="flex items-start justify-between">
        <span
          className={`grid size-14 place-items-center rounded-full text-lg font-bold text-white ${driver.avatar}`}
        >
          {driver.initials}
        </span>
        <div className="flex items-center gap-2">
          <DriverStatus status={driver.status} />
        </div>
      </div>
      <h2 className="mt-5 text-lg font-bold text-foreground">{driver.name}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {driver.id} · Since {driver.joined}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
        <DriverInfo icon={CarFront} label="Vehicle" value={driver.vehicle} />
        <DriverInfo icon={FileCheck2} label="Plate" value={driver.plate} />
        <DriverInfo icon={Phone} label="Phone" value={driver.phone} />
        <DriverInfo
          icon={Activity}
          label="Trips"
          value={`${driver.trips} this week`}
        />
      </dl>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="flex items-center gap-1.5 text-sm">
          <Star className="size-4 fill-secondary text-secondary" />
          <strong>{driver.rating}</strong>
          <span className="text-muted-foreground">rating</span>
        </span>
        <Link
          className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold text-primary transition hover:bg-muted"
          href={`/drivers/${driver.id}`}
        >
          <Eye className="size-4" />
          View profile
        </Link>
      </div>
    </article>
  );
}

function DriverInfo({
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
      <dd
        className="mt-1.5 truncate font-semibold text-foreground"
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function DriverStatus({ status }: { status: DriverStatus }) {
  const style = {
    Active: "bg-emerald-50 text-emerald-700",
    "On trip": "bg-blue-50 text-blue-600",
    "Off duty": "bg-slate-100 text-brand-muted",
  }[status];
  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${style}`}>
      {status}
    </span>
  );
}

import { getDriverApplicationsApi } from "@/lib/api";

export function ApplicationsTable() {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [tab, setTab] = useState("All");
  const [liveApps, setLiveApps] = useState<typeof applications | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      if (token) {
        getDriverApplicationsApi(token).then((res) => {
          if (res.success && res.data && Array.isArray(res.data)) {
            const mapped = res.data.map((a: any) => ({
              id: a.applicationId || `APP-${a._id.substring(a._id.length - 4)}`,
              name: a.fullName || "Applicant",
              phone: a.phone || "(555) 000-0000",
              email: a.email || "applicant@example.com",
              type: a.positionType ? a.positionType.charAt(0) + a.positionType.slice(1).toLowerCase() : "Ambulatory",
              license: a.licenseNumber || "CDL-A 0000000",
              start: a.submittedDate ? new Date(a.submittedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jan 15, 2026",
              background: a.backgroundStatus === "CLEARED" ? "Cleared" : a.backgroundStatus === "FAILED" ? "Failed" : "Pending",
              submitted: a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Dec 28, 2025",
              status: a.status === "APPROVED" ? "Approved" : a.status === "REJECTED" ? "Rejected" : a.status === "INTERVIEW_SCHEDULED" ? "Interview scheduled" : "Pending review",
            }));
            if (mapped.length > 0) {
              setLiveApps(mapped);
            }
          }
        });
      }
    }
  }, []);

  const activeApps = liveApps || applications;
  const tabs = ["All", "Pending", "Rejected", "Archived"];
  const filtered = activeApps.filter(
    (item) =>
      (tab === "All" ||
        (tab === "Pending"
          ? item.status.includes("Pending") ||
            item.status.includes("Interview") ||
            item.status.includes("Missing")
          : tab === "Rejected"
            ? item.status === "Rejected"
            : false)) &&
      [item.name, item.id, item.email, item.status].some((value) =>
        value.toLowerCase().includes(query.toLowerCase()),
      ),
  );
  const visible = filtered.slice(0, pageSize);
  return (
    <section className="overflow-hidden rounded-xl border border-[#e1e6ee] bg-card shadow-[0_4px_14px_rgba(15,37,74,.04)]">
      <header className="flex items-center justify-between border-b border-border px-5 py-3.5 sm:px-6">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-icon" />
            <input
              className="h-10 w-full rounded-lg border border-input bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary focus:bg-card"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search applicants..."
              type="search"
              value={query}
            />
          </div>
          <div className="flex gap-1">
            {tabs.map((item) => (
              <button
                className={`h-9 rounded-lg px-3 text-xs font-bold ${tab === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                key={item}
                onClick={() => setTab(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-280 text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/55 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              <th className="px-6 py-3.5">Applicant</th>
              <th>Contact</th>
              <th>Position</th>
              <th>License</th>
              <th>Start date</th>
              <th>Background</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr
                className="border-b border-border/80 last:border-0 hover:bg-muted/30"
                key={item.id}
              >
                <td className="px-6 py-4">
                  <strong className="block text-sm text-foreground">
                    {item.name}
                  </strong>
                  <span className="text-[10px] text-brand-placeholder">
                    {item.id}
                  </span>
                </td>
                <td>
                  <span className="block text-foreground">{item.phone}</span>
                  <span className="mt-1 block text-[10px] text-brand-placeholder">
                    {item.email}
                  </span>
                </td>
                <td>
                  <span className="font-medium text-foreground">
                    Driver — {item.type}
                  </span>
                  <span className="mt-1 block w-fit rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600">
                    Full time
                  </span>
                </td>
                <td className="text-muted-foreground">{item.license}</td>
                <td className="text-muted-foreground">{item.start}</td>
                <td>
                  <ApplicationBadge value={item.background} />
                </td>
                <td className="text-muted-foreground">{item.submitted}</td>
                <td>
                  <ApplicationBadge value={item.status} />
                </td>
                <td>
                  <Link
                    aria-label={`View ${item.name}`}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                    href={`/drivers/applications/${item.id}`}
                  >
                    <Eye className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-border lg:hidden">
        {visible.map((item) => (
          <article className="p-5" key={item.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-foreground">{item.name}</h3>
                <p className="mt-1 text-[10px] text-brand-placeholder">
                  {item.id}
                </p>
              </div>
              <ApplicationBadge value={item.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <p>
                <Mail className="mr-1 inline size-3 text-brand-icon" />
                {item.email}
              </p>
              <p>{item.type}</p>
              <p>{item.license}</p>
              <p>{item.start}</p>
            </div>
          </article>
        ))}
      </div>
      <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            Rows{" "}
            <select
              className="h-9 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-foreground"
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </label>
          <span>
            Showing {visible.length} of {filtered.length} applications
          </span>
        </div>
        <div className="flex gap-1">
          <button
            className="grid size-8 place-items-center rounded-lg border border-border"
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"
            type="button"
          >
            1
          </button>
          <button
            className="grid size-8 place-items-center rounded-lg border border-border"
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </footer>
    </section>
  );
}

function ApplicationBadge({ value }: { value: string }) {
  const tone =
    value === "Cleared"
      ? "bg-emerald-50 text-emerald-700"
      : value === "Failed" || value === "Rejected"
        ? "bg-red-50 text-red-600"
        : value === "Interview scheduled"
          ? "bg-blue-50 text-blue-600"
          : "bg-amber-50 text-amber-700";
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-bold ${tone}`}
    >
      {value}
    </span>
  );
}
