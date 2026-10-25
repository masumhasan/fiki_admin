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
  Trash2,
  UserRoundCog,
  X,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Pencil,
  Calendar,
  Clock,
  DollarSign,
  Info,
  Copy,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  getAdminTripDetailApi,
  getAdminDriversApi,
  assignDriverApi,
  cancelTripAdminApi,
  deleteTripApi,
  updateAdminTripStatusApi,
  updateAdminTripApi,
} from "@/lib/api";

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return "TR";
}

function formatDate(dateVal?: string | Date): string {
  if (!dateVal) return "—";
  if (typeof dateVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
    const [year, month, day] = dateVal.trim().split("-").map(Number);
    const noonUtc = new Date(Date.UTC(year, month - 1, day, 18, 0, 0));
    return noonUtc.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Chicago",
    });
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  });
}

function formatTimeTo12Hour(timeStr?: string): string {
  if (!timeStr) return "";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

function formatTime(dateVal?: string | Date): string {
  if (!dateVal) return "—";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Chicago",
  });
}

function getStatusBadge(status: string, cancellationReason?: string) {
  if (
    status === "CANCELLED" &&
    (cancellationReason === "No Show Up" || cancellationReason === "NO_SHOW")
  ) {
    return {
      label: "No Show Up",
      class: "bg-amber-50 text-amber-800 border border-amber-300 font-bold",
    };
  }
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
      return {
        label: "Quote Accepted",
        class: "bg-emerald-50 text-emerald-700",
      };
    case "QUOTE_COUNTERED":
      return { label: "Counter Offer", class: "bg-purple-50 text-purple-700" };
    case "MISSED":
      return { label: "Missed", class: "bg-rose-50 text-rose-700 border border-rose-200" };
    case "REQUESTED":
    default:
      return { label: "Requested", class: "bg-amber-50 text-amber-700" };
  }
}

export const TRIP_STATUS_OPTIONS = [
  { value: "REQUESTED", label: "Requested" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DRIVER_ARRIVING", label: "Heading to pickup" },
  { value: "DRIVER_ARRIVED", label: "Passenger picked up" },
  { value: "IN_PROGRESS", label: "Heading to destination" },
  { value: "COMPLETED", label: "Trip completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "MISSED", label: "Missed" },
];

export function TripDetailPage({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  // Action states
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [approvedDrivers, setApprovedDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [reassigning, setReassigning] = useState(false);

  // Status Change States
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState("");
  const [cancellationReason, setCancellationReason] = useState("Cancelled by Admin");
  const [customCancellationReason, setCustomCancellationReason] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState("");
  const [copiedRequestId, setCopiedRequestId] = useState(false);

  // Edit Trip Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSection, setEditSection] = useState<"all" | "pickup" | "dropoff" | "notes">("all");
  const [editForm, setEditForm] = useState({
    pickupAddress: "",
    dropoffAddress: "",
    pickupDate: "",
    pickupTime: "",
    appointmentTime: "",
    endDate: "",
    fare: "",
    driverNotes: "",
    specialInstructions: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const handleOpenEditModal = (section: "all" | "pickup" | "dropoff" | "notes" = "all") => {
    if (!trip) return;
    const currentPickupAddr = trip.pickupLocation?.address || trip.streetAddress || "";
    const currentDropoffAddr = trip.dropoffLocation?.address || trip.destinationAddress || trip.returnDestinationAddress || "";

    let currentPickupDate = "";
    const rawDateVal = trip.pickupDate || trip.startDate || trip.createdAt;
    if (typeof rawDateVal === "string" && /^\d{4}-\d{2}-\d{2}/.test(rawDateVal.trim())) {
      currentPickupDate = rawDateVal.trim().substring(0, 10);
    } else if (rawDateVal) {
      const d = new Date(rawDateVal);
      if (!isNaN(d.getTime())) {
        currentPickupDate = d.toISOString().split("T")[0];
      }
    }

    let currentEndDate = "";
    const rawEndVal = trip.endDate || trip.returnDate;
    if (typeof rawEndVal === "string" && /^\d{4}-\d{2}-\d{2}/.test(rawEndVal.trim())) {
      currentEndDate = rawEndVal.trim().substring(0, 10);
    } else if (rawEndVal) {
      const d = new Date(rawEndVal);
      if (!isNaN(d.getTime())) {
        currentEndDate = d.toISOString().split("T")[0];
      }
    } else {
      currentEndDate = currentPickupDate;
    }

    const currentPickupTime = trip.pickupTime || "";
    const currentApptTime = trip.appointmentTime || "";
    const currentFare = trip.fare !== undefined && trip.fare !== null
      ? String(trip.fare)
      : (trip.quotedFare !== undefined && trip.quotedFare !== null ? String(trip.quotedFare) : "");
    const currentDriverNotes = trip.driverNotes || "";
    const currentSpecialInstructions = trip.specialInstructions || trip.accessInformation || "";

    setEditForm({
      pickupAddress: currentPickupAddr,
      dropoffAddress: currentDropoffAddr,
      pickupDate: currentPickupDate,
      pickupTime: currentPickupTime,
      appointmentTime: currentApptTime,
      endDate: currentEndDate,
      fare: currentFare,
      driverNotes: currentDriverNotes,
      specialInstructions: currentSpecialInstructions,
    });
    setEditSection(section);
    setEditError("");
    setEditModalOpen(true);
  };

  const handleSaveTripEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editForm.pickupAddress.trim()) {
      setEditError("Pickup address is required.");
      return;
    }
    if (!editForm.dropoffAddress.trim()) {
      setEditError("Drop-off address is required.");
      return;
    }

    setSavingEdit(true);
    setEditError("");
    try {
      const token = window.localStorage.getItem("fiki_auth_token") || "";
      const res = await updateAdminTripApi(token, tripId, {
        pickupAddress: editForm.pickupAddress.trim(),
        dropoffAddress: editForm.dropoffAddress.trim(),
        pickupDate: editForm.pickupDate || undefined,
        startDate: editForm.pickupDate || undefined,
        pickupTime: editForm.pickupTime || undefined,
        appointmentTime: editForm.appointmentTime || undefined,
        endDate: editForm.endDate || undefined,
        returnDate: editForm.endDate || undefined,
        fare: editForm.fare ? Number(editForm.fare) : undefined,
        driverNotes: editForm.driverNotes,
        specialInstructions: editForm.specialInstructions,
      });

      if (res.success && res.data) {
        setTrip(res.data);
        setEditModalOpen(false);
        setStatusSuccessMessage("Trip details updated successfully! Live route and schedule are now synced on the Driver Portal.");
        setTimeout(() => setStatusSuccessMessage(""), 5000);
        await fetchTripDetail();
      } else {
        setEditError(res.error?.message || "Failed to update trip information.");
      }
    } catch {
      setEditError("A network error occurred while updating trip.");
    } finally {
      setSavingEdit(false);
    }
  };

  const isCancelled = trip?.status === "CANCELLED";
  const isCompleted = trip?.status === "COMPLETED";
  const isNoShow =
    trip?.status === "CANCELLED" &&
    (trip?.cancellationReason === "No Show Up" ||
      trip?.cancellationReason === "NO_SHOW");
  const isScheduled = trip
    ? ["REQUESTED", "QUOTE_ACCEPTED", "ACCEPTED", "DRIVER_ARRIVING", "DRIVER_ARRIVED"].includes(trip.status)
    : false;
  const canAssignOrReassign = isScheduled && !isCompleted && !isCancelled && !isNoShow;

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
    if (!canAssignOrReassign) {
      alert("Driver can only be assigned or reassigned to scheduled trips.");
      return;
    }
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

  const handleInitiateStatusChange = (newStatus: string) => {
    if (!newStatus || newStatus === trip?.status) return;
    setTargetStatus(newStatus);
    setCancellationReason("Cancelled by Admin");
    setCustomCancellationReason("");
    setStatusNotes("");
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!targetStatus || !trip) return;
    setStatusUpdating(true);
    try {
      const token = window.localStorage.getItem("fiki_auth_token") || "";
      const reason =
        targetStatus === "CANCELLED"
          ? cancellationReason === "Other"
            ? customCancellationReason || "Cancelled by Admin"
            : cancellationReason
          : undefined;

      const res = await updateAdminTripStatusApi(token, tripId, targetStatus, {
        cancellationReason: reason,
        note: statusNotes || undefined,
      });

      if (res.success) {
        setStatusSuccessMessage(
          `Trip status successfully updated to ${getStatusBadge(targetStatus).label}!`
        );
        setStatusModalOpen(false);
        await fetchTripDetail();
        setTimeout(() => setStatusSuccessMessage(""), 4500);
      } else {
        alert(res.error?.message || "Failed to update trip status.");
      }
    } catch {
      alert("Network error while updating trip status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm("Are you sure you want to delete this trip? This action is permanent and will remove it from all financial accounting.")) return;
    setDeleting(true);
    try {
      const token = window.localStorage.getItem("fiki_auth_token") || "";
      const res = await deleteTripApi(token, tripId);
      if (res.success) {
        router.push("/ride-requests?tab=trips");
      } else {
        alert(res.error?.message || "Failed to delete trip.");
        setDeleting(false);
      }
    } catch {
      alert("Network error while deleting trip.");
      setDeleting(false);
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
        <p className="text-sm font-semibold text-muted-foreground">
          Loading trip details...
        </p>
      </div>
    );
  }

  if (errorText || !trip) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
        <AlertTriangle className="mx-auto size-10 text-red-500" />
        <h2 className="mt-3 text-lg font-bold text-foreground">
          Trip Not Found
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {errorText || "Could not retrieve details for this trip."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-semibold text-foreground transition hover:bg-muted"
            href="/ride-requests?tab=trips"
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
  const passengerName = trip.fullName || trip.passengerId?.fullName || trip.passengerId?.name || "Passenger";
  const passengerPhone = trip.phoneNumber || trip.passengerId?.phone || "—";
  const passengerEmail = trip.email || trip.passengerId?.email || "—";
  const passengerInitials = getInitials(passengerName);
  const passengerAvatarUrl = trip.passengerAvatarUrl || trip.passengerId?.avatarUrl;

  const driverObj = trip.driverId;
  const driverName = driverObj?.name || "Unassigned Driver";
  const driverPhone = driverObj?.phone || "—";
  const driverInitials = driverObj ? getInitials(driverName) : "—";
  const driverAvatarUrl = driverObj?.photoUrl || driverObj?.avatarUrl;
  const driverProfile = trip.driverProfile;
  const driverAvailability = driverProfile?.availabilityStatus || "Active";

  const vehicleObj = driverProfile?.vehicle;
  const vehicleName = vehicleObj
    ? [vehicleObj.make, vehicleObj.model].filter(Boolean).join(" ") ||
      "Assigned Vehicle"
    : "No Vehicle Assigned";
  const vehiclePlate = vehicleObj?.licensePlate || "—";

  const pickupAddress =
    trip.pickupLocation?.address || trip.streetAddress || "—";
  const dropoffAddress =
    trip.dropoffLocation?.address || trip.returnDestinationAddress || "—";
  const pickupTimeStr = [
    trip.pickupTime ? formatTimeTo12Hour(trip.pickupTime) : "",
    trip.pickupDate ? formatDate(trip.pickupDate) : formatDate(trip.createdAt),
  ]
    .filter(Boolean)
    .join(" · ");
  const dropoffMeta = trip.appointmentTime
    ? `Appointment: ${formatTimeTo12Hour(trip.appointmentTime)}`
    : `Scheduled: ${formatDate(trip.scheduledTime || trip.createdAt)}`;

  const driverNotes =
    trip.driverNotes?.trim() ||
    "No Additional driver notes";
  const customerNotes =
    (trip.specialInstructions || trip.accessInformation)?.trim() ||
    "No Special instructions";

  const statusBadge = getStatusBadge(trip.status, trip.cancellationReason);

  // Ride Request identification
  const parentIdStr = trip.parentRequestId
    ? (typeof trip.parentRequestId === "object"
        ? (trip.parentRequestId._id || trip.parentRequestId).toString()
        : String(trip.parentRequestId))
    : null;

  const rootRideRequestId = parentIdStr || trip._id || tripId;
  const isChildTrip = Boolean(parentIdStr && parentIdStr !== (trip._id || tripId));
  const requestShortId = rootRideRequestId
    ? `RR-${rootRideRequestId.slice(-4).toUpperCase()}`
    : "—";

  // Timeline steps computation
  const timelineSteps = [
    {
      label: "Trip requested",
      time: formatTime(trip.createdAt),
      done: true,
    },
    {
      label: trip.quotedFare
        ? `Quote accepted ($${trip.quotedFare})`
        : "Ride confirmed",
      time: formatTime(trip.quotedAt || trip.createdAt),
      done: trip.status !== "REQUESTED",
    },
    {
      label: driverObj
        ? `Driver assigned (${driverName})`
        : "Driver assignment pending",
      time: driverObj ? formatTime(trip.updatedAt) : "—",
      done: Boolean(driverObj),
    },
    {
      label: isNoShow
        ? "Trip cancelled (Passenger No Show Up)"
        : isCancelled
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

  // Activity events & status steps for Ride Activity card
  function formatStepTimeFull(dateVal?: string | Date): string | null {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Chicago",
    });
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Chicago",
    });
    return `${dateStr} ${timeStr}`;
  }

  const createdTimeStr =
    formatStepTimeFull(trip.createdAt) || "Aug 25, 2026 9:40 AM";
  const assignedTimeStr =
    formatStepTimeFull(trip.assignedAt || trip.createdAt) || createdTimeStr;
  const acceptedTimeStr =
    formatStepTimeFull(trip.acceptedAt || trip.assignedAt || trip.createdAt) ||
    assignedTimeStr;
  const arrivingTimeStr = formatStepTimeFull(trip.arrivingAt);
  const arrivedTimeStr = formatStepTimeFull(trip.arrivedAt);
  const inProgressTimeStr = formatStepTimeFull(
    trip.inProgressAt || trip.startedAt,
  );
  const completedTimeStr = formatStepTimeFull(trip.completedAt);
  const cancelledTimeStr = formatStepTimeFull(trip.cancelledAt);

  const isAssigned = Boolean(driverObj);
  const isAccepted = [
    "ACCEPTED",
    "DRIVER_ARRIVING",
    "DRIVER_ARRIVED",
    "IN_PROGRESS",
    "COMPLETED",
  ].includes(trip.status);
  const isHeadingPickup = [
    "DRIVER_ARRIVING",
    "DRIVER_ARRIVED",
    "IN_PROGRESS",
    "COMPLETED",
  ].includes(trip.status);
  const isPickedUp = ["DRIVER_ARRIVED", "IN_PROGRESS", "COMPLETED"].includes(
    trip.status,
  );
  const isHeadingDest = ["IN_PROGRESS", "COMPLETED"].includes(trip.status);
  const isCompletedStatus = trip.status === "COMPLETED";

  const rideStatusSteps = [
    {
      label: isAssigned ? `Assigned (${driverName})` : "Assigned",
      time: isAssigned ? assignedTimeStr : "Pending",
      done: isAssigned,
      current: trip.status === "REQUESTED" && isAssigned,
    },
    {
      label: "Accepted",
      time: isAccepted ? acceptedTimeStr : "Pending",
      done: isAccepted,
      current: trip.status === "ACCEPTED",
    },
    {
      label: "Heading to pickup",
      time: isHeadingPickup ? arrivingTimeStr || acceptedTimeStr : "Upcoming",
      done: isHeadingPickup,
      current: trip.status === "DRIVER_ARRIVING",
    },
    {
      label: "Passenger picked up",
      time: isPickedUp
        ? arrivedTimeStr || arrivingTimeStr || acceptedTimeStr
        : "Upcoming",
      done: isPickedUp,
      current: trip.status === "DRIVER_ARRIVED",
    },
    {
      label: "Heading to destination",
      time: isHeadingDest ? inProgressTimeStr || arrivedTimeStr : "Upcoming",
      done: isHeadingDest,
      current: trip.status === "IN_PROGRESS",
    },
    {
      label: isNoShow ? "No Show Up (Cancelled)" : "Trip completed",
      time: isCompletedStatus
        ? completedTimeStr || inProgressTimeStr
        : isNoShow
          ? `No Show Up (${cancelledTimeStr})`
          : isCancelled
            ? `Cancelled (${cancelledTimeStr})`
            : "Upcoming",
      done: isCompletedStatus || isNoShow,
      current: false,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="flex h-9 w-fit items-center gap-2 rounded-lg border border-[#dce4ed] bg-white px-3 text-xs font-semibold text-[#52647e] transition hover:border-[#173d76]/30 hover:bg-[#f3f6fa] hover:text-[#173d76]"
          href="/ride-requests?tab=trips"
        >
          <ArrowLeft className="size-4" /> Back to trips
        </Link>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <ToolbarButton
            icon={Printer}
            label="Print"
            onClick={() => window.print()}
          />
          <ToolbarButton icon={Download} label="Export" onClick={exportTrip} />
          <ToolbarButton
            icon={Pencil}
            label="Edit trip"
            onClick={() => handleOpenEditModal("all")}
          />
          {canAssignOrReassign && (
            <ToolbarButton
              icon={UserRoundCog}
              label={driverObj ? "Reassign driver" : "Assign driver"}
              onClick={handleOpenReassignModal}
            />
          )}
          <button
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-400 px-3 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
            disabled={isCancelled || isCompleted || cancelling}
            onClick={handleCancelTrip}
            type="button"
          >
            {cancelling ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="size-3.5" />
                Cancel trip
              </>
            )}
          </button>
          <button
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 text-xs font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
            disabled={deleting}
            onClick={handleDeleteTrip}
            type="button"
          >
            <Trash2 className="size-3.5" />
            {deleting ? "Deleting..." : "Delete trip"}
          </button>
        </div>
      </div>

      {/* No Show Notice Banner */}
      {isNoShow && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="size-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">
              Passenger No Show Up
            </h3>
            <p className="mt-0.5 text-xs text-amber-800 leading-relaxed">
              This trip was recorded as No Show Up by the driver. The passenger was not charged for this trip ($0.00 fare), Hand to Hand signature verification was waived, and no driver trip bonus was applied.
              {trip.driverShiftNotes && (
                <span className="block mt-1 font-semibold italic">
                  Driver notes: "{trip.driverShiftNotes}"
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Status Success Message Banner */}
      {statusSuccessMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900 shadow-xs animate-in fade-in slide-in-from-top-2">
          <Check className="size-4.5 text-emerald-600 shrink-0" />
          <span>{statusSuccessMessage}</span>
        </div>
      )}

      {/* Main Overview Box */}
      <section className="rounded-xl border border-[#e1e6ee] bg-card p-5 shadow-[0_4px_14px_rgba(15,37,74,.04)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-[-0.035em] text-foreground sm:text-[28px]">
                Trip {trip._id || tripId}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusBadge.class}`}
              >
                {statusBadge.label}
              </span>
              {isNoShow ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-900 border border-amber-300">
                  $0.00 (Passenger not charged - No Show Up)
                </span>
              ) : trip.fare || trip.quotedFare ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold text-emerald-800">
                  ${trip.fare || trip.quotedFare}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {pickupTimeStr} · {pickupAddress} → {dropoffAddress}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Actual Ride Request ID Box (Area marked in red) */}
            <div className="flex items-center gap-3 rounded-xl border border-[#dce4ed] bg-[#f8fafc] px-3.5 py-2 shadow-2xs">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#173d76]/10 text-[#173d76]">
                <FileText className="size-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                    {isChildTrip ? "Parent Ride Request" : "Ride Request ID"}
                  </span>
                  {isChildTrip ? (
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-blue-700">
                      {trip.legType === "RETURN" || trip.isReturnLeg ? "Return Leg" : "Outbound Leg"}
                    </span>
                  ) : (
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-slate-700">
                      Master Request
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <Link
                    href={`/ride-requests/${rootRideRequestId}`}
                    className="group inline-flex items-center gap-1.5 font-mono text-sm font-black text-[#173d76] hover:text-[#0b2347] hover:underline"
                    title={`Open Ride Request ${rootRideRequestId}`}
                  >
                    <span>{requestShortId}</span>
                    <span className="font-normal text-[11px] text-[#64748b] group-hover:text-[#173d76]">
                      ({rootRideRequestId.slice(-6)})
                    </span>
                    <ExternalLink className="size-3 text-[#173d76]/70 group-hover:text-[#173d76]" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(rootRideRequestId);
                      setCopiedRequestId(true);
                      setTimeout(() => setCopiedRequestId(false), 2000);
                    }}
                    className="inline-flex size-6 items-center justify-center rounded border border-[#cbd5e1] bg-white text-[#64748b] transition hover:bg-[#e2e8f0] hover:text-[#173d76]"
                    title={`Copy full ID: ${rootRideRequestId}`}
                  >
                    {copiedRequestId ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Change Trip Status Selector (Header Location) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-[#dce4ed] bg-[#f8fafc] p-2.5 shadow-2xs shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569] whitespace-nowrap">
                Change Trip Status:
              </span>
              <select
                id="header-change-trip-status-select"
                value={trip.status}
                onChange={(e) => handleInitiateStatusChange(e.target.value)}
                disabled={statusUpdating}
                className="h-9 min-w-[190px] rounded-lg border border-[#cbd5e1] bg-white px-3 text-xs font-bold text-[#173d76] shadow-2xs transition hover:border-[#173d76] focus:border-[#173d76] focus:outline-none focus:ring-2 focus:ring-[#173d76]/20 cursor-pointer disabled:opacity-50"
              >
                {TRIP_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Overview Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* Passenger Card */}
        <PersonCard
          avatar={passengerInitials}
          avatarUrl={passengerAvatarUrl}
          label="Passenger"
          name={passengerName}
        >
          <p>{passengerPhone}</p>
          <p>{passengerEmail}</p>
        </PersonCard>

        {/* Driver Card */}
        <PersonCard
          avatar={driverInitials}
          avatarUrl={driverAvatarUrl}
          dark
          label="Driver"
          name={driverName}
        >
          <p>{driverPhone}</p>
          {driverObj && (
            <div className="mt-1 flex items-center">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 capitalize">
                {driverAvailability.toLowerCase()}
              </span>
            </div>
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
              <p className="mt-1 text-xs text-muted-foreground">
                {vehiclePlate}
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Main Details & Timeline Grid */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,0.75fr)]">
        <div className="space-y-5">
          {/* Route Details */}
          <section className={cardClass}>
            <div className="flex items-center justify-between">
              <h2 className={titleClass}>Route details</h2>
              <button
                type="button"
                onClick={() => handleOpenEditModal("all")}
                className="flex items-center gap-1.5 rounded-lg border border-[#dce4ed] bg-white px-2.5 py-1 text-xs font-bold text-[#173d76] shadow-2xs transition hover:border-[#173d76] hover:bg-[#f3f6fa] cursor-pointer"
              >
                <Pencil className="size-3" /> Edit route
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <RoutePoint
                label="Pickup"
                location={pickupAddress}
                meta={pickupTimeStr}
                pickup
                onEdit={() => handleOpenEditModal("pickup")}
              />
              <RoutePoint
                label="Drop-off"
                location={dropoffAddress}
                meta={dropoffMeta}
                onEdit={() => handleOpenEditModal("dropoff")}
              />
            </div>
          </section>

          {/* Notes Cards */}
          <section className="grid gap-4 sm:grid-cols-2">
            <NoteCard title="Driver notes">{driverNotes}</NoteCard>
            <NoteCard title="Customer notes">{customerNotes}</NoteCard>
          </section>

          {/* Hand to Hand Receiver Signature Card */}
          {(trip.receiverSignature ||
            (Array.isArray(trip.mobilityOptions) &&
              trip.mobilityOptions.some((o: string) =>
                o.toLowerCase().includes("hand"),
              ))) && (
            <section className={cardClass}>
              <div className="flex items-center justify-between border-b border-border pb-3.5 mb-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    <FileCheck2 className="size-5" />
                  </span>
                  <div>
                    <h2 className={titleClass}>
                      Hand to Hand Drop-off Verification
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Receiver Digital Signature & Handover Confirmation
                    </p>
                  </div>
                </div>
                {trip.receiverSignature ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    Signed & Verified
                  </span>
                ) : isNoShow ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    Not Required (No Show Up)
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    Signature Required
                  </span>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Receiver Full Name
                    </p>
                    <p className="mt-0.5 font-bold text-foreground text-sm">
                      {trip.receiverName || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Relationship / Role
                    </p>
                    <p className="mt-0.5 font-bold text-foreground">
                      {trip.receiverRelationship || "Assigned Representative"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Date & Time Signed
                    </p>
                    <p className="mt-0.5 font-bold text-foreground">
                      {trip.receiverSignedAt
                        ? formatStepTimeFull(trip.receiverSignedAt)
                        : isNoShow
                          ? "Waived (Passenger No Show Up)"
                          : "Pending Drop-off Signature"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Receiver Digital Signature
                  </p>
                  {trip.receiverSignature ? (
                    <div className="rounded-xl border border-border bg-slate-50 p-3 text-center">
                      <img
                        src={trip.receiverSignature}
                        alt="Receiver Signature"
                        className="mx-auto max-h-24 object-contain"
                      />
                    </div>
                  ) : isNoShow ? (
                    <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-amber-300/80 bg-amber-50/50 p-4 text-center text-xs text-amber-800 font-medium">
                      Signature waived: Passenger did not show up for pickup.
                    </div>
                  ) : (
                    <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-border bg-slate-50 p-4 text-center text-xs text-muted-foreground">
                      Receiver signature will be captured by driver upon
                      drop-off
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar: Timeline & Activity */}
        <aside className="space-y-5">
          {/* Trip Timeline */}
          <section className={cardClass}>
            <h2 className={titleClass}>Trip timeline</h2>
            <ol className="mt-5">
              {timelineSteps.map((item, index) => (
                <li
                  className="relative flex gap-3 pb-5 last:pb-0"
                  key={item.label}
                >
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
                    <p
                      className={`text-xs font-semibold ${item.done ? "text-foreground" : "text-brand-soft"}`}
                    >
                      {item.label}
                    </p>
                    <p className="mt-1 text-[11px] text-brand-placeholder">
                      {item.time}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Ride Activity */}
          <section className={cardClass}>
            <div className="flex flex-col gap-3 border-b border-border/70 pb-3.5 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className={titleClass}>Ride activity</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Trip lifecycle progression
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="ride-activity-status-selector"
                  className="text-xs font-semibold text-muted-foreground whitespace-nowrap"
                >
                  Change Trip Status:
                </label>
                <select
                  id="ride-activity-status-selector"
                  value={trip.status}
                  onChange={(e) => handleInitiateStatusChange(e.target.value)}
                  disabled={statusUpdating}
                  className="h-8.5 rounded-lg border border-[#cbd5e1] bg-white px-2.5 text-xs font-bold text-[#173d76] shadow-2xs transition hover:border-[#173d76] focus:border-[#173d76] focus:outline-none focus:ring-2 focus:ring-[#173d76]/20 cursor-pointer disabled:opacity-50"
                >
                  {TRIP_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {rideStatusSteps.map((item, idx) => (
                <div className="flex items-start gap-3" key={idx}>
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                      item.done
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : item.current
                          ? "bg-amber-50 text-amber-600 border border-amber-200"
                          : "bg-slate-50 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {item.done ? (
                      <Check className="size-4 text-emerald-600" />
                    ) : (
                      <FileText className="size-4 text-slate-400" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs font-bold ${item.done ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {item.label}
                      </p>
                      {item.current && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Reassign Driver Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground">
                Reassign Driver
              </h3>
              <button
                onClick={() => setReassignModalOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="py-5 space-y-3">
              <label className="text-xs font-bold text-foreground">
                Select Approved Driver
              </label>
              {approvedDrivers.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Loading approved drivers...
                </p>
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

      {/* Change Trip Status Confirmation Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-[28px] border border-border bg-card p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <RefreshCw className="size-4.5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Change Trip Status
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Confirm status transition & portal synchronization
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="py-5 space-y-4">
              {/* Status Transition Card */}
              <div className="rounded-2xl border border-border bg-slate-50/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Status Transition
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Current:</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge.class}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">New Status:</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        getStatusBadge(targetStatus).class
                      }`}
                    >
                      {getStatusBadge(targetStatus).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informational Warning Box */}
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs text-blue-900 leading-relaxed">
                <AlertTriangle className="size-4.5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Multi-Portal Sync Notice:</span> This change takes effect immediately and updates trip progression across the <strong className="font-bold">Admin Portal</strong>, <strong className="font-bold">Driver Portal</strong>, and <strong className="font-bold">Passenger App</strong>.
                  {targetStatus === "COMPLETED" && (
                    <span className="block mt-1.5 font-semibold text-emerald-800">
                      ✓ Completing this trip will record it in driver earnings, increment driver completed trip count, and free up driver availability.
                    </span>
                  )}
                  {targetStatus === "CANCELLED" && (
                    <span className="block mt-1.5 font-semibold text-red-800">
                      ⚠ Cancelling this trip will mark it as cancelled and reset driver availability to online.
                    </span>
                  )}
                  {targetStatus === "IN_PROGRESS" && (
                    <span className="block mt-1.5 font-semibold text-blue-800">
                      ℹ Setting to in progress will update the driver app to show active transport with drop-off directions.
                    </span>
                  )}
                </div>
              </div>

              {/* Cancellation Reason if CANCELLED */}
              {targetStatus === "CANCELLED" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">
                    Cancellation Reason
                  </label>
                  <select
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary"
                  >
                    <option value="Cancelled by Admin">Cancelled by Admin</option>
                    <option value="No Show Up">Passenger No Show Up ($0.00 fare)</option>
                    <option value="Customer Requested Cancellation">Customer Requested Cancellation</option>
                    <option value="Driver Unavailable">Driver Unavailable</option>
                    <option value="Vehicle Breakdown">Vehicle Breakdown</option>
                    <option value="Weather / Road Conditions">Weather / Road Conditions</option>
                    <option value="Other">Other (Custom Reason)</option>
                  </select>
                  {cancellationReason === "Other" && (
                    <input
                      type="text"
                      placeholder="Specify reason..."
                      value={customCancellationReason}
                      onChange={(e) => setCustomCancellationReason(e.target.value)}
                      className="mt-2 h-9 w-full rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-primary"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                disabled={statusUpdating}
                className="h-9 rounded-xl border border-border px-4 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusUpdating}
                onClick={handleConfirmStatusChange}
                className="flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer transition disabled:opacity-50 shadow-xs"
              >
                {statusUpdating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Updating Status...
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    Confirm & Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trip Information Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-slate-50/80 px-6 py-4.5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Pencil className="size-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Edit Trip Information
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Update route, pickup date, times, and operational notes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer transition"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Quick Section Tabs */}
            <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-6 py-2.5 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setEditSection("all")}
                className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                  editSection === "all"
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                All Information
              </button>
              <button
                type="button"
                onClick={() => setEditSection("pickup")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition cursor-pointer ${
                  editSection === "pickup"
                    ? "bg-emerald-600 text-white font-bold shadow-2xs"
                    : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                <MapPin className="size-3" /> Pickup Details
              </button>
              <button
                type="button"
                onClick={() => setEditSection("dropoff")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition cursor-pointer ${
                  editSection === "dropoff"
                    ? "bg-red-600 text-white font-bold shadow-2xs"
                    : "text-red-700 hover:bg-red-50 hover:text-red-800"
                }`}
              >
                <MapPin className="size-3" /> Drop-off Details
              </button>
              <button
                type="button"
                onClick={() => setEditSection("notes")}
                className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                  editSection === "notes"
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Notes & Fare
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveTripEdit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {editError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-900">
                  <AlertTriangle className="size-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Section 1: Pickup Information */}
              {(editSection === "all" || editSection === "pickup") && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                      <MapPin className="size-3 text-emerald-700" /> Pickup Details
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      Starting route origin
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">
                      Pickup Address / Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 size-4 text-emerald-600" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 8415 airport rd Middleton wi"
                        value={editForm.pickupAddress}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, pickupAddress: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-white pl-9 pr-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        Pickup Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <input
                          type="date"
                          value={editForm.pickupDate}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, pickupDate: e.target.value }))}
                          className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-white pl-9 pr-3 text-xs font-semibold text-foreground outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {editForm.pickupDate ? formatDate(editForm.pickupDate) : "Select date"}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        Pickup Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="e.g. 10:00 AM or 10:00"
                          value={editForm.pickupTime}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, pickupTime: e.target.value }))}
                          className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-white pl-9 pr-3 text-xs font-semibold text-foreground outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Formatted: {editForm.pickupTime ? formatTimeTo12Hour(editForm.pickupTime) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Drop-off Information */}
              {(editSection === "all" || editSection === "dropoff") && (
                <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-red-800 bg-red-100/80 border border-red-300 px-2.5 py-0.5 rounded-full">
                      <MapPin className="size-3 text-red-600" /> Drop-off Details
                    </span>
                    <span className="text-[11px] text-red-700 font-medium">
                      Trip destination
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">
                      Drop-off Address / Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 size-4 text-red-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 209 Hillside Terrace Poynette wi"
                        value={editForm.dropoffAddress}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, dropoffAddress: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-white pl-9 pr-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        Scheduled / Return Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <input
                          type="date"
                          value={editForm.endDate}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, endDate: e.target.value }))}
                          className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-white pl-9 pr-3 text-xs font-semibold text-foreground outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 shadow-2xs"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {editForm.endDate ? formatDate(editForm.endDate) : "Select date"}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        Appointment / Arrival Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="e.g. 11:00 AM or 11:00"
                          value={editForm.appointmentTime}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, appointmentTime: e.target.value }))}
                          className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-white pl-9 pr-3 text-xs font-semibold text-foreground outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 shadow-2xs"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Formatted: {editForm.appointmentTime ? formatTimeTo12Hour(editForm.appointmentTime) : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3: Notes & Pricing */}
              {(editSection === "all" || editSection === "notes") && (
                <div className="rounded-2xl border border-border bg-slate-50/70 p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                      <DollarSign className="size-3 text-slate-700" /> Fare & Instructions
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">
                      Trip Fare ($ USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 40.00"
                        value={editForm.fare}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, fare: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-white pl-9 pr-3 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        Driver Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Additional driver notes..."
                        value={editForm.driverNotes}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, driverNotes: e.target.value }))}
                        className="w-full rounded-xl border border-[#cbd5e1] bg-white p-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        Customer / Special Instructions
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Customer access or assistance instructions..."
                        value={editForm.specialInstructions}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, specialInstructions: e.target.value }))}
                        className="w-full rounded-xl border border-[#cbd5e1] bg-white p-3 text-xs font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Informational Sync Callout */}
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 leading-relaxed">
                <Info className="size-4.5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Driver Portal Synchronization:</span> Saving changes updates this trip immediately in the database. The assigned driver will immediately see the updated pickup location, drop-off destination, schedule date, and timing across their Driver Dashboard and Ride Details.
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border bg-slate-50/80 px-6 py-4">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                disabled={savingEdit}
                className="h-9 rounded-xl border border-border px-4 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveTripEdit}
                className="flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer transition disabled:opacity-50 shadow-xs"
              >
                {savingEdit ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardClass =
  "rounded-xl border border-[#e1e6ee] bg-card p-5 shadow-[0_4px_14px_rgba(15,37,74,.04)] sm:p-5";
const eyebrowClass =
  "text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground";
const titleClass = "text-base font-bold tracking-[-0.02em] text-foreground";

function PersonCard({
  avatar,
  avatarUrl,
  children,
  dark = false,
  label,
  name,
}: {
  avatar: string;
  avatarUrl?: string;
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
          className={`grid size-12 shrink-0 place-items-center rounded-full text-sm font-bold text-white overflow-hidden ${dark ? "bg-primary" : "bg-violet-600"}`}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            avatar
          )}
        </span>
        <div>
          <h2 className="font-bold text-foreground">{name}</h2>
          <div className="mt-1 space-y-1 text-xs text-muted-foreground">
            {children}
          </div>
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
  onEdit,
}: {
  label: string;
  location: string;
  meta: string;
  pickup?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${pickup ? "border-emerald-200 bg-emerald-50/70" : "border-red-200 bg-red-50/65"}`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${pickup ? "text-emerald-600" : "text-red-500"}`}
        >
          <MapPin className="size-3.5" /> {label}
        </p>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition shadow-2xs cursor-pointer ${
              pickup
                ? "border-emerald-300 bg-white/90 text-emerald-700 hover:bg-white hover:text-emerald-800 hover:border-emerald-400"
                : "border-red-300 bg-white/90 text-red-700 hover:bg-white hover:text-red-800 hover:border-red-400"
            }`}
          >
            <Pencil className="size-3" /> Edit
          </button>
        )}
      </div>
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
