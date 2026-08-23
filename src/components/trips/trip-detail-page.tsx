"use client";

import {
  ArrowLeft,
  CarFront,
  Check,
  CircleUserRound,
  Download,
  FileCheck2,
  FileText,
  Loader2,
  type LucideIcon,
  MapPin,
  Printer,
  Star,
  UserRoundCog,
  X,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  getAdminTripDetailApi,
  getAdminDriversApi,
  assignDriverApi,
  cancelTripAdminApi,
} from "@/lib/api";

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return "TR";
}

function formatDate(dateVal?: string | Date): string {
  if (!dateVal) return "—";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatTime(dateVal?: string | Date): string {
  if (!dateVal) return "—";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return { label: "Completed", class: "bg-emerald-50 text-emerald-700" };
    case "CANCELLED":
      return { label: "Cancelled", class: "bg-red-50 text-red-600" };
    case "IN_PROGRESS":
      return { label: "In Progress", class: "bg-blue-50 text-blue-700" };
    case "DRIVER_ARRIVING":
      return { label: "Driver Arriving", class: "bg-blue-50 text-blue-700" };
    case "DRIVER_ARRIVED":
      return { label: "Driver Arrived", class: "bg-blue-50 text-blue-700" };
    case "ACCEPTED":
      return { label: "Accepted", class: "bg-emerald-50 text-emerald-700" };
    case "QUOTE_SENT":
      return { label: "Quote Sent", class: "bg-amber-50 text-amber-700" };
    case "QUOTE_ACCEPTED":
      return { label: "Quote Accepted", class: "bg-emerald-50 text-emerald-700" };
    case "QUOTE_COUNTERED":
      return { label: "Counter Offer", class: "bg-purple-50 text-purple-700" };
    case "REQUESTED":
    default:
      return { label: "Requested", class: "bg-amber-50 text-amber-700" };
  }
}

export function TripDetailPage({ tripId }: { tripId: string }) {
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  // Action states
  const [cancelling, setCancelling] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [approvedDrivers, setApprovedDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [reassigning, setReassigning] = useState(false);

  const fetchTripDetail = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setErrorText("Authentication token missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorText("");
    try {
      const res = await getAdminTripDetailApi(token, tripId);
      if (res.success && res.data) {
        setTrip(res.data);
      } else {
        setErrorText(res.error?.message || "Failed to load trip details.");
      }
    } catch {
      setErrorText("A network error occurred while fetching trip details.");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripDetail();
  }, [fetchTripDetail]);

  const handleOpenReassignModal = async () => {
    setReassignModalOpen(true);
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) return;
    const res = await getAdminDriversApi(token, { approvalStatus: "APPROVED" });
    if (res.success && res.data && Array.isArray(res.data.drivers)) {
      setApprovedDrivers(res.data.drivers);
      if (res.data.drivers.length > 0) {
        setSelectedDriverId(res.data.drivers[0].id || res.data.drivers[0]._id);
      }
    }
  };

  const handleConfirmReassign = async () => {
    if (!selectedDriverId) return;
    setReassigning(true);
    try {
      const token = window.localStorage.getItem("fiki_auth_token") || "";
      const res = await assignDriverApi(token, tripId, selectedDriverId);
      if (res.success) {
        setReassignModalOpen(false);
        await fetchTripDetail();
      } else {
        alert(res.error?.message || "Failed to reassign driver.");
      }
    } catch {
      alert("Network error while reassigning driver.");
    } finally {
      setReassigning(false);
    }
  };

  const handleCancelTrip = async () => {
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;
    setCancelling(true);
    try {
      const token = window.localStorage.getItem("fiki_auth_token") || "";
      const res = await cancelTripAdminApi(token, tripId, "Cancelled by Admin");
      if (res.success) {
        await fetchTripDetail();
      } else {
        alert(res.error?.message || "Failed to cancel trip.");
      }
    } catch {
      alert("Network error while cancelling trip.");
    } finally {
      setCancelling(false);
    }
  };

  function exportTrip() {
    if (!trip) return;
    const content = JSON.stringify(trip, null, 2);
    const url = URL.createObjectURL(
      new Blob([content], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `Trip-${tripId}-details.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Loading trip details...</p>
      </div>
    );
  }

  if (errorText || !trip) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
        <AlertTriangle className="mx-auto size-10 text-red-500" />
        <h2 className="mt-3 text-lg font-bold text-foreground">Trip Not Found</h2>
        <p className="mt-1 text-xs text-muted-foreground">{errorText || "Could not retrieve details for this trip."}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-semibold text-foreground transition hover:bg-muted"
            href="/trips"
          >
            <ArrowLeft className="size-4" /> Back to trips
          </Link>
          <button
            onClick={fetchTripDetail}
            className="h-9 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Data processing
  const passengerName = trip.fullName || trip.passengerId?.name || "Passenger";
  const passengerPhone = trip.phoneNumber || trip.passengerId?.phone || "—";
  const passengerEmail = trip.email || trip.passengerId?.email || "—";
  const passengerInitials = getInitials(passengerName);

  const driverObj = trip.driverId;
  const driverName = driverObj?.name || "Unassigned Driver";
  const driverPhone = driverObj?.phone || "—";
  const driverInitials = driverObj ? getInitials(driverName) : "—";
  const driverProfile = trip.driverProfile;
  const driverRating = driverProfile?.rating ? String(driverProfile.rating) : "5.0";
  const driverAvailability = driverProfile?.availabilityStatus || "Active";

  const vehicleObj = driverProfile?.vehicle;
  const vehicleName = vehicleObj
    ? [vehicleObj.make, vehicleObj.model].filter(Boolean).join(" ") || "Assigned Vehicle"
    : "No Vehicle Assigned";
  const vehiclePlate = vehicleObj?.licensePlate || "—";

  const pickupAddress = trip.pickupLocation?.address || trip.streetAddress || "—";
  const dropoffAddress = trip.dropoffLocation?.address || trip.returnDestinationAddress || "—";
  const pickupTimeStr = [trip.pickupTime, trip.pickupDate ? formatDate(trip.pickupDate) : formatDate(trip.createdAt)].filter(Boolean).join(" · ");
  const dropoffMeta = trip.appointmentTime ? `Appointment: ${trip.appointmentTime}` : `Scheduled: ${formatDate(trip.scheduledTime || trip.createdAt)}`;

  const driverNotes = trip.driverNotes || "Passenger requires standard transit assistance. Vehicle is clean and prepped.";
  const customerNotes = trip.specialInstructions || trip.accessInformation || "Standard pick-up request. Please call driver on arrival.";

  const statusBadge = getStatusBadge(trip.status);
  const isCancelled = trip.status === "CANCELLED";
  const isCompleted = trip.status === "COMPLETED";

  // Timeline steps computation
  const timelineSteps = [
    {
      label: "Trip requested",
      time: formatTime(trip.createdAt),
      done: true,
    },
    {
      label: trip.quotedFare ? `Quote accepted ($${trip.quotedFare})` : "Ride confirmed",
      time: formatTime(trip.quotedAt || trip.createdAt),
      done: trip.status !== "REQUESTED",
    },
    {
      label: driverObj ? `Driver assigned (${driverName})` : "Driver assignment pending",
      time: driverObj ? formatTime(trip.updatedAt) : "—",
      done: Boolean(driverObj),
    },
    {
      label: isCancelled
        ? "Trip cancelled"
        : isCompleted
          ? "Passenger arrived at destination"
          : "Driver en route / trip in progress",
      time: isCancelled
        ? formatTime(trip.cancelledAt)
        : isCompleted
          ? formatTime(trip.completedAt)
          : "In progress",
      done: isCompleted || isCancelled,
    },
  ];

  // Activity events from auditLogs or timestamps
  const auditLogs: any[] = Array.isArray(trip.auditLogs) ? trip.auditLogs : [];
  const activityList = auditLogs.length > 0
    ? auditLogs.map((log: any) => ({
        label: log.action ? log.action.replace(/_/g, " ") : "Action logged",
        time: formatDate(log.timestamp) + " " + formatTime(log.timestamp),
        icon: log.action?.includes("CANCEL") ? X : log.action?.includes("ASSIGN") ? CircleUserRound : Check,
        tone: log.action?.includes("CANCEL") ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500",
      }))
    : [
        {
          label: `Trip ${trip.status.toLowerCase().replace(/_/g, " ")}`,
          time: formatDate(trip.updatedAt || trip.createdAt) + " " + formatTime(trip.updatedAt || trip.createdAt),
          icon: isCancelled ? X : Check,
          tone: isCancelled ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500",
        },
        {
          label: "Request submitted",
          time: formatDate(trip.createdAt) + " " + formatTime(trip.createdAt),
          icon: FileText,
          tone: "bg-slate-100 text-brand-muted",
        },
      ];

  return (
    <div className="space-y-5">
      {/* Top Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="flex h-9 w-fit items-center gap-2 rounded-lg border border-[#dce4ed] bg-white px-3 text-xs font-semibold text-[#52647e] transition hover:border-[#173d76]/30 hover:bg-[#f3f6fa] hover:text-[#173d76]"
          href="/trips"
        >
          <ArrowLeft className="size-4" /> Back to trips
        </Link>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <ToolbarButton icon={Printer} label="Print" onClick={() => window.print()} />
          <ToolbarButton icon={Download} label="Export" onClick={exportTrip} />
          <ToolbarButton
            icon={UserRoundCog}
            label={driverObj ? "Reassign driver" : "Assign driver"}
            onClick={handleOpenReassignModal}
          />
          <button
            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-red-400 px-3 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
            disabled={isCancelled || isCompleted || cancelling}
            onClick={handleCancelTrip}
            type="button"
          >
            {cancelling ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
            {isCancelled ? "Ride cancelled" : "Cancel ride"}
          </button>
        </div>
      </div>

      {/* Main Overview Box */}
      <section className="rounded-xl border border-[#e1e6ee] bg-card p-5 shadow-[0_4px_14px_rgba(15,37,74,.04)] sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-[-0.035em] text-foreground sm:text-[28px]">
            Trip {trip._id || tripId}
          </h1>
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusBadge.class}`}>
            {statusBadge.label}
          </span>
          {trip.fare || trip.quotedFare ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold text-emerald-800">
              ${trip.fare || trip.quotedFare}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {pickupTimeStr} · {pickupAddress} → {dropoffAddress}
        </p>
      </section>

      {/* 3 Overview Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* Passenger Card */}
        <PersonCard avatar={passengerInitials} label="Passenger" name={passengerName}>
          <p>{passengerPhone}</p>
          <p>{passengerEmail}</p>
        </PersonCard>

        {/* Driver Card */}
        <PersonCard avatar={driverInitials} dark label="Driver" name={driverName}>
          <p>{driverPhone}</p>
          {driverObj && (
            <p className="flex items-center gap-1 font-bold text-foreground">
              <Star className="size-3.5 fill-secondary text-secondary" /> {driverRating}
              <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 capitalize">
                {driverAvailability.toLowerCase()}
              </span>
            </p>
          )}
        </PersonCard>

        {/* Vehicle Card */}
        <article className={cardClass}>
          <p className={eyebrowClass}>Vehicle</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-500">
              <CarFront className="size-6" />
            </span>
            <div>
              <h2 className="font-bold text-foreground">{vehicleName}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{vehiclePlate}</p>
            </div>
          </div>
        </article>
      </section>

      {/* Main Details & Timeline Grid */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,0.75fr)]">
        <div className="space-y-5">
          {/* Route Details */}
          <section className={cardClass}>
            <h2 className={titleClass}>Route details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <RoutePoint
                label="Pickup"
                location={pickupAddress}
                meta={pickupTimeStr}
                pickup
              />
              <RoutePoint
                label="Drop-off"
                location={dropoffAddress}
                meta={dropoffMeta}
              />
            </div>
          </section>

          {/* Notes Cards */}
          <section className="grid gap-4 sm:grid-cols-2">
            <NoteCard title="Driver notes">{driverNotes}</NoteCard>
            <NoteCard title="Customer notes">{customerNotes}</NoteCard>
          </section>
        </div>

        {/* Sidebar: Timeline & Activity */}
        <aside className="space-y-5">
          {/* Trip Timeline */}
          <section className={cardClass}>
            <h2 className={titleClass}>Trip timeline</h2>
            <ol className="mt-5">
              {timelineSteps.map((item, index) => (
                <li className="relative flex gap-3 pb-5 last:pb-0" key={item.label}>
                  {index < timelineSteps.length - 1 ? (
                    <span
                      className={`absolute left-[13px] top-7 h-full w-px ${item.done ? "bg-primary" : "bg-border"}`}
                    />
                  ) : null}
                  <span
                    className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-[10px] ${
                      item.done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted text-brand-soft"
                    }`}
                  >
                    {item.done ? <Check className="size-3.5" /> : null}
                  </span>
                  <div>
                    <p className={`text-xs font-semibold ${item.done ? "text-foreground" : "text-brand-soft"}`}>
                      {item.label}
                    </p>
                    <p className="mt-1 text-[11px] text-brand-placeholder">{item.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Ride Activity */}
          <section className={cardClass}>
            <h2 className={titleClass}>Ride activity</h2>
            <div className="mt-5 space-y-4">
              {activityList.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div className="flex gap-3" key={idx}>
                    <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${item.tone}`}>
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-foreground capitalize">{item.label}</p>
                      <p className="mt-1 text-[10px] text-brand-placeholder">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      {/* Reassign Driver Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground">Reassign Driver</h3>
              <button
                onClick={() => setReassignModalOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="py-5 space-y-3">
              <label className="text-xs font-bold text-foreground">Select Approved Driver</label>
              {approvedDrivers.length === 0 ? (
                <p className="text-xs text-muted-foreground">Loading approved drivers...</p>
              ) : (
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary"
                >
                  {approvedDrivers.map((d) => (
                    <option key={d.id || d._id} value={d.id || d._id}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setReassignModalOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                disabled={reassigning || !selectedDriverId}
                onClick={handleConfirmReassign}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {reassigning ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardClass = "rounded-xl border border-[#e1e6ee] bg-card p-5 shadow-[0_4px_14px_rgba(15,37,74,.04)] sm:p-5";
const eyebrowClass = "text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground";
const titleClass = "text-base font-bold tracking-[-0.02em] text-foreground";

function PersonCard({
  avatar,
  children,
  dark = false,
  label,
  name,
}: {
  avatar: string;
  children: React.ReactNode;
  dark?: boolean;
  label: string;
  name: string;
}) {
  return (
    <article className={cardClass}>
      <p className={eyebrowClass}>{label}</p>
      <div className="mt-4 flex items-center gap-3">
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-full text-sm font-bold text-white ${dark ? "bg-primary" : "bg-violet-600"}`}
        >
          {avatar}
        </span>
        <div>
          <h2 className="font-bold text-foreground">{name}</h2>
          <div className="mt-1 space-y-1 text-xs text-muted-foreground">{children}</div>
        </div>
      </div>
    </article>
  );
}

function RoutePoint({
  label,
  location,
  meta,
  pickup = false,
}: {
  label: string;
  location: string;
  meta: string;
  pickup?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${pickup ? "border-emerald-200 bg-emerald-50/70" : "border-red-200 bg-red-50/65"}`}
    >
      <p
        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${pickup ? "text-emerald-600" : "text-red-500"}`}
      >
        <MapPin className="size-3.5" /> {label}
      </p>
      <p className="mt-4 text-sm font-bold text-foreground">{location}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{meta}</p>
    </div>
  );
}

function NoteCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <article className={cardClass}>
      <h2 className={titleClass}>{title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{children}</p>
    </article>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground transition hover:bg-muted"
      onClick={onClick}
      type="button"
    >
      <Icon className="size-4" /> {label}
    </button>
  );
}
