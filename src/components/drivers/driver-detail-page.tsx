"use client";

import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CircleDollarSign,
  DollarSign,
  Info,
  LoaderCircle,
  Mail,
  Phone,
  Route,
  Star,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getAdminDriverDetailApi, updateDriverEarningsApi } from "@/lib/api";

export interface FortnightPeriod {
  id: string;
  startDate: string;
  endDate: string;
  label: string;
  isCurrent: boolean;
  expectedPayDate: string;
  payrollStatus: "Approved" | "Paid" | "Entered into Payroll" | "Waiting Deposit";
}

export function DriverDetailPage({ driverId }: { driverId: string }) {
  const [tab, setTab] = useState<"profile" | "earnings">("profile");
  const [loading, setLoading] = useState(true);
  const [fetchingPeriod, setFetchingPeriod] = useState(false);
  const [driver, setDriver] = useState<any>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<FortnightPeriod | null>(null);
  const [availablePeriods, setAvailablePeriods] = useState<FortnightPeriod[]>([]);
  const [currentPayrollStatus, setCurrentPayrollStatus] = useState<string>("Approved");

  const fetchDriverDetail = async (startDate?: string, endDate?: string) => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    setFetchingPeriod(true);
    const res = await getAdminDriverDetailApi(token, driverId, startDate, endDate);
    setFetchingPeriod(false);

    if (res.success && res.data) {
      setDriver(res.data);
      if (res.data.availablePeriods) {
        setAvailablePeriods(res.data.availablePeriods);
      }
      if (res.data.selectedPeriod) {
        setSelectedPeriod(res.data.selectedPeriod);
      }
      if (res.data.payrollStatus) {
        setCurrentPayrollStatus(res.data.payrollStatus);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDriverDetail().finally(() => setLoading(false));
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
  const earnings = driver?.earnings || null;

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
          driverId={driverId}
          completedTrips={completedTrips}
          allTrips={allTrips}
          stats={stats}
          earnings={earnings}
          driverName={name}
          selectedPeriod={selectedPeriod}
          availablePeriods={availablePeriods}
          currentPayrollStatus={currentPayrollStatus}
          fetchingPeriod={fetchingPeriod}
          onSelectPeriod={(period) => {
            setSelectedPeriod(period);
            fetchDriverDetail(period.startDate, period.endDate);
          }}
          onUpdatePayrollStatus={async (newStatus) => {
            const token = window.localStorage.getItem("fiki_auth_token");
            if (!token || !selectedPeriod) return;
            const res = await updateDriverEarningsApi(token, driverId, {
              periodId: selectedPeriod.id,
              payrollStatus: newStatus,
            });
            if (res.success) {
              setCurrentPayrollStatus(newStatus);
              fetchDriverDetail(selectedPeriod.startDate, selectedPeriod.endDate);
            }
          }}
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
  driverId,
  completedTrips,
  allTrips,
  stats,
  earnings,
  driverName,
  selectedPeriod,
  availablePeriods,
  currentPayrollStatus,
  fetchingPeriod,
  onSelectPeriod,
  onUpdatePayrollStatus,
}: {
  driverId: string;
  completedTrips: any[];
  allTrips: any[];
  stats: { completedTrips: number; totalTrips: number; totalFare: number };
  earnings: any;
  driverName: string;
  selectedPeriod: FortnightPeriod | null;
  availablePeriods: FortnightPeriod[];
  currentPayrollStatus: string;
  fetchingPeriod: boolean;
  onSelectPeriod: (period: FortnightPeriod) => void;
  onUpdatePayrollStatus: (newStatus: string) => Promise<void>;
}) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const money = (v: number) => `$${v.toFixed(2)}`;

  // Close selector dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const payPeriodRange = selectedPeriod?.label || "Aug 17 – Aug 31, 2026";
  const currentPeriodIndex = availablePeriods.findIndex((p) => p.id === selectedPeriod?.id);
  const hasPrevPeriod = currentPeriodIndex < availablePeriods.length - 1;
  const hasNextPeriod = currentPeriodIndex > 0;

  const handleNavigatePeriod = (direction: "prev" | "next") => {
    if (!selectedPeriod || availablePeriods.length === 0) return;
    const currentIndex = availablePeriods.findIndex((p) => p.id === selectedPeriod.id);
    if (currentIndex === -1) return;

    const newIndex = direction === "prev" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < availablePeriods.length) {
      onSelectPeriod(availablePeriods[newIndex]);
    }
  };

  const handleStatusChange = async (status: string) => {
    setUpdatingStatus(true);
    await onUpdatePayrollStatus(status);
    setUpdatingStatus(false);
  };

  const payrollOptions = [
    { value: "Approved", label: "Approved", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    { value: "Entered into Payroll", label: "Entered into Payroll", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { value: "Waiting Deposit", label: "Waiting Deposit", color: "bg-amber-100 text-amber-800 border-amber-300" },
    { value: "Paid", label: "Paid", color: "bg-purple-100 text-purple-800 border-purple-300" },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header: Pay Period Selector Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-xl border border-[#e1e6ee] shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-foreground">Pay Period Overview</h2>
          <p className="text-xs text-muted-foreground">Viewing earnings for period starting from driver join date</p>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setSelectorOpen((v) => !v)}
            disabled={fetchingPeriod}
            className="flex h-10 items-center gap-2.5 rounded-xl border border-border bg-card px-4 text-xs font-semibold shadow-sm transition-all hover:bg-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
            aria-expanded={selectorOpen}
          >
            {fetchingPeriod ? (
              <LoaderCircle className="size-4 animate-spin text-primary" />
            ) : (
              <CalendarDays className="size-4 text-primary" />
            )}
            <span className="font-bold text-foreground">{payPeriodRange}</span>
            {selectedPeriod?.isCurrent && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                CURRENT
              </span>
            )}
            <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${selectorOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Selector Dropdown / Popover Modal */}
          {selectorOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card p-4 shadow-2xl animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground">Select Pay Period</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectorOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Quick Stepper Navigation */}
              <div className="my-3 flex items-center justify-between rounded-xl bg-muted/60 p-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleNavigatePeriod("prev")}
                  disabled={!hasPrevPeriod}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                  <span>Previous</span>
                </button>
                <span className="text-[11px] font-bold text-muted-foreground">Fortnightly Cycles</span>
                <button
                  type="button"
                  onClick={() => handleNavigatePeriod("next")}
                  disabled={!hasNextPeriod}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* Period List */}
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {availablePeriods.map((period) => {
                  const isSelected = selectedPeriod?.id === period.id;
                  return (
                    <button
                      key={period.id}
                      type="button"
                      onClick={() => {
                        onSelectPeriod(period);
                        setSelectorOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 font-bold text-primary border border-primary/20"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{period.label}</span>
                        <span className="text-[10px] text-muted-foreground">
                          Pay Date: {period.expectedPayDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {period.isCurrent ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                            CURRENT
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                            {period.payrollStatus || "PAID"}
                          </span>
                        )}
                        {isSelected && <Check className="size-4 text-primary shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 border-t border-border pt-2 text-[10px] text-muted-foreground text-center">
                Filtered from driver&apos;s join date
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Payroll Status Controller Card */}
      <section className="rounded-xl border border-primary/20 bg-primary/4 p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <WalletCards className="size-4" />
              <span>Payroll Status Controller</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Manage payment status for <strong>{payPeriodRange}</strong> (reflects in Driver Portal)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {payrollOptions.map((opt) => {
              const isSelected = currentPayrollStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={updatingStatus}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? `${opt.color} ring-2 ring-primary/30 font-bold shadow-xs`
                      : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {isSelected && <Check className="size-3.5" />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
            {updatingStatus && <LoaderCircle className="size-4 animate-spin text-primary ml-1" />}
          </div>
        </div>
      </section>

      {/* Summary Metrics */}
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
          label="Estimated Gross"
          value={money(earnings?.grossEarnings ?? stats.totalFare)}
        />
      </section>

      {/* Trip History Table */}
      <section className="overflow-hidden rounded-xl border border-[#e1e6ee] bg-card shadow-[0_4px_14px_rgba(15,37,74,.04)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <h2 className={sectionTitle}>Trip history</h2>
          <span className="text-[10px] text-muted-foreground font-medium">
            Pay Period: <strong>{payPeriodRange}</strong> · {allTrips.length} trips
          </span>
        </div>
        {allTrips.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <CarFront className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              No trips found for this pay period
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              This driver has no trips recorded for <strong>{payPeriodRange}</strong>.
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
        <Info className="size-4 shrink-0 mt-0.5" />
        <p>
          <strong>Earnings note:</strong> Fare totals are based on trip records
          for the selected pay period (<strong>{payPeriodRange}</strong>). Changing the payroll status updates the driver portal view for this fortnight.
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
