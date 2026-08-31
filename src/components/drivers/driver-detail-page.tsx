"use client";

import {
  ArrowLeft,
  CarFront,
  Check,
  DollarSign,
  Info,
  LoaderCircle,
  Mail,
  Phone,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminDriverDetailApi } from "@/lib/api";

export function DriverDetailPage({ driverId }: { driverId: string }) {
  const [tab, setTab] = useState<"profile" | "earnings">("profile");
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getAdminDriverDetailApi(token, driverId).then((res) => {
      if (res.success && res.data) setDriver(res.data);
      setLoading(false);
    });
  }, [driverId]);

  const name = driver?.name || "—";
  const email = driver?.email || "—";
  const phone = driver?.phone || "—";
  const accountStatus = driver?.accountStatus || "—";
  const isActive = accountStatus === "ACTIVE";
  const createdAt = driver?.createdAt
    ? new Date(driver.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const profile = driver?.profile || null;
  const licenseNumber = profile?.licenseNumber || "—";
  const licenseExpirationDate = profile?.licenseExpirationDate
    ? (() => {
        const d = new Date(profile.licenseExpirationDate);
        return !isNaN(d.getTime())
          ? d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })
          : profile.licenseExpirationDate;
      })()
    : "—";

  const vehicle = profile?.vehicle;
  const vehicleText = vehicle
    ? [vehicle.make, vehicle.model].filter(Boolean).join(" ") +
      (vehicle.licensePlate ? ` — ${vehicle.licensePlate}` : "")
    : "—";

  const completedTrips: any[] = (driver?.trips || []).filter(
    (t: any) => t.status === "COMPLETED",
  );
  const allTrips: any[] = driver?.trips || [];
  const stats = driver?.stats || {
    completedTrips: 0,
    totalTrips: 0,
    totalFare: 0,
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    SUSPENDED: "bg-red-50 text-red-600",
    PENDING: "bg-amber-50 text-amber-600",
    INACTIVE: "bg-gray-100 text-gray-500",
  };
  const statusBadge =
    statusColors[accountStatus] || "bg-gray-100 text-gray-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <p className="text-sm font-semibold text-foreground">
          Driver not found or you are not authorized.
        </p>
        <Link
          href="/drivers"
          className="mt-4 inline-block text-xs font-bold text-primary hover:underline"
        >
          ← Back to Drivers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-[#16345e]">
              Driver details
            </h1>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${statusBadge}`}
            >
              {isActive && <Check className="size-3.5" />}
              {accountStatus.charAt(0) + accountStatus.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="mt-1 text-sm">
            <strong className="text-foreground">{name}</strong>
            <span className="text-muted-foreground"> · {driverId}</span>
          </p>
        </div>
        <Link
          aria-label="Back to drivers"
          className="flex h-9 items-center gap-2 rounded-lg border border-[#dce4ed] bg-white px-3 text-xs font-semibold text-[#52647e] hover:bg-muted hover:text-primary"
          href="/drivers"
        >
          <ArrowLeft className="size-3.5" />
          Back to Drivers
        </Link>
      </section>

      <div className="flex border-b border-border">
        {(["profile", "earnings"] as const).map((t) => (
          <button
            key={t}
            className={`relative px-5 py-3 text-sm font-bold capitalize ${tab === t ? "text-primary" : "text-muted-foreground"}`}
            onClick={() => setTab(t)}
            type="button"
          >
            {t === "profile" ? "Driver profile" : "Earnings"}
            {tab === t && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <ProfileTab
          driverId={driverId}
          name={name}
          email={email}
          phone={phone}
          licenseNumber={licenseNumber}
          licenseExpirationDate={licenseExpirationDate}
          vehicleText={vehicleText}
          createdAt={createdAt}
          accountStatus={accountStatus}
          completedTripsCount={stats.completedTrips}
          availabilityStatus={profile?.availabilityStatus || "—"}
          avatarUrl={driver?.avatarUrl || profile?.avatarUrl || ""}
        />
      ) : (
        <EarningsTab
          completedTrips={completedTrips}
          allTrips={allTrips}
          stats={stats}
          driverName={name}
        />
      )}
    </div>
  );
}

function ProfileTab({
  driverId,
  name,
  email,
  phone,
  licenseNumber,
  licenseExpirationDate,
  vehicleText,
  createdAt,
  accountStatus,
  completedTripsCount,
  availabilityStatus,
  avatarUrl,
}: {
  driverId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpirationDate: string;
  vehicleText: string;
  createdAt: string;
  accountStatus: string;
  completedTripsCount: number;
  availabilityStatus: string;
  avatarUrl?: string;
}) {
  const initials =
    name !== "—"
      ? name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "—";

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className={`${cardClass} xl:sticky xl:top-24`}>
        <div className="text-center">
          <span className="mx-auto grid size-24 place-items-center overflow-hidden rounded-2xl bg-primary text-3xl font-bold text-primary-foreground">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="size-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <h2 className="mt-5 text-xl font-bold text-foreground">{name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{driverId}</p>
          <span
            className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold ${accountStatus === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}
          >
            {accountStatus === "ACTIVE" && <Check className="size-3" />}
            {accountStatus.charAt(0) + accountStatus.slice(1).toLowerCase()}
          </span>
        </div>
        <div className="mt-6 space-y-3 border-t border-border pt-5">
          <Contact icon={Phone} value={phone} />
          <Contact icon={Mail} value={email} />
          <Contact icon={CarFront} value={vehicleText} />
        </div>
      </aside>

      <div className="space-y-5">
        <InformationCard
          title="Personal information"
          items={[
            ["Full name", name],
            ["Driver ID", driverId],
            ["Phone number", phone],
            ["Email address", email],
          ]}
        />
        <InformationCard
          title="Employment details"
          items={[
            ["Driver license no.", licenseNumber],
            ["License expiration", licenseExpirationDate],
            ["Join date", createdAt],
            ["Assigned vehicle", vehicleText],
            ["Approval status", accountStatus],
            ["Availability", availabilityStatus],
            ["Completed trips", String(completedTripsCount)],
          ]}
        />
      </div>
    </div>
  );
}

function EarningsTab({
  completedTrips,
  allTrips,
  stats,
  driverName,
}: {
  completedTrips: any[];
  allTrips: any[];
  stats: { completedTrips: number; totalTrips: number; totalFare: number };
  driverName: string;
}) {
  const money = (v: number) => `$${v.toFixed(2)}`;

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <EarningMetric
          icon={CarFront}
          label="Total trips"
          value={String(stats.totalTrips)}
        />
        <EarningMetric
          icon={Check}
          label="Completed trips"
          value={String(stats.completedTrips)}
        />
        <EarningMetric
          icon={DollarSign}
          label="Total fares"
          value={money(stats.totalFare)}
        />
        <EarningMetric
          icon={Star}
          label="Driver"
          value={driverName !== "—" ? driverName.split(" ")[0] : "—"}
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e1e6ee] bg-card shadow-[0_4px_14px_rgba(15,37,74,.04)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <h2 className={sectionTitle}>Trip history</h2>
          <span className="text-[10px] text-muted-foreground">
            {allTrips.length} total trips on record
          </span>
        </div>
        {allTrips.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <CarFront className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              No trips found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              This driver has not completed any trips yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-210 text-left text-xs">
              <thead>
                <tr className="bg-muted/55 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  <th className="px-5 py-3">Date</th>
                  <th>Passenger</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Fare</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allTrips.map((trip) => (
                  <tr className="border-t border-border" key={trip._id}>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {trip.createdAt
                        ? new Date(trip.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="py-3.5 font-medium text-foreground">
                      {trip.passengerName || "—"}
                    </td>
                    <td
                      className="max-w-36 truncate py-3.5 pr-4 text-muted-foreground"
                      title={trip.pickup || ""}
                    >
                      {trip.pickup || "—"}
                    </td>
                    <td
                      className="max-w-36 truncate py-3.5 pr-4 text-muted-foreground"
                      title={trip.dropoff || ""}
                    >
                      {trip.dropoff || "—"}
                    </td>
                    <td className="py-3.5 font-semibold text-foreground">
                      {trip.fare != null ? money(trip.fare) : "—"}
                    </td>
                    <td className="py-3.5">
                      <TripStatusBadge status={trip.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <aside className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs leading-5 text-blue-700">
        <Info className="size-4 shrink-0" />
        <p>
          <strong>Earnings note:</strong> Fare totals are based on trip records
          in the system. Payroll processing, bonuses, and deductions are managed
          separately by the payroll team.
        </p>
      </aside>
    </div>
  );
}

function TripStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    COMPLETED: "bg-emerald-50 text-emerald-700",
    IN_PROGRESS: "bg-blue-50 text-blue-600",
    CANCELLED: "bg-red-50 text-red-600",
    ACCEPTED: "bg-violet-50 text-violet-700",
    REQUESTED: "bg-amber-50 text-amber-700",
    DRIVER_ARRIVING: "bg-blue-50 text-blue-600",
    DRIVER_ARRIVED: "bg-blue-50 text-blue-600",
  };
  const label: Record<string, string> = {
    COMPLETED: "Completed",
    IN_PROGRESS: "In progress",
    CANCELLED: "Cancelled",
    ACCEPTED: "Accepted",
    REQUESTED: "Requested",
    DRIVER_ARRIVING: "Arriving",
    DRIVER_ARRIVED: "Arrived",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${styles[status] || "bg-muted text-muted-foreground"}`}
    >
      {label[status] || status}
    </span>
  );
}

const cardClass =
  "rounded-xl border border-[#e1e6ee] bg-card p-5 shadow-[0_4px_14px_rgba(15,37,74,.04)] sm:p-5";
const sectionTitle =
  "text-sm font-bold uppercase tracking-[0.04em] text-primary";

function Contact({ icon: Icon, value }: { icon: typeof Phone; value: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-brand-label">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-brand-icon">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 truncate">{value}</span>
    </div>
  );
}

function InformationCard({
  items,
  title,
}: {
  items: string[][];
  title: string;
}) {
  return (
    <section className={cardClass}>
      <h2 className={sectionTitle}>{title}</h2>
      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm font-bold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function EarningMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border border-[#e1e6ee] bg-card p-4 shadow-[0_4px_14px_rgba(15,37,74,.04)]">
      <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-500">
        <Icon className="size-4" />
      </span>
      <p className="mt-4 text-lg font-bold text-foreground">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
    </article>
  );
}
