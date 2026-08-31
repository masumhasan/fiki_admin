"use client";

import {
  Accessibility,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileCheck,
  FileText,
  LoaderCircle,
  MapPin,
  PenTool,
  Route,
  Send,
  Shield,
  UserCheck,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { assignDriverApi, getAdminDriversApi, getAdminTripDetailApi, respondToCounterOfferApi } from "@/lib/api";

const card =
  "overflow-hidden rounded-xl border border-[#e1e6ee] bg-white shadow-[0_4px_14px_rgba(15,37,74,.04)]";

function statusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case "REQUESTED": return { text: "Pending Approval", color: "amber" };
    case "QUOTE_SENT": return { text: "Quote Sent", color: "blue" };
    case "QUOTE_ACCEPTED": return { text: "Quote Accepted", color: "green" };
    case "QUOTE_DENIED": return { text: "Quote Declined", color: "red" };
    case "QUOTE_COUNTERED": return { text: "Counter Offer", color: "violet" };
    case "ACCEPTED": return { text: "Driver Assigned", color: "green" };
    case "DRIVER_ARRIVING": return { text: "Driver Arriving", color: "blue" };
    case "DRIVER_ARRIVED": return { text: "Driver Arrived", color: "blue" };
    case "IN_PROGRESS": return { text: "In Progress", color: "blue" };
    case "COMPLETED": return { text: "Completed", color: "green" };
    case "CANCELLED": return { text: "Cancelled", color: "red" };
    default: return { text: status, color: "amber" };
  }
}

export default function RideRequestDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignFeedback, setAssignFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) { setLoading(false); return; }

    Promise.all([
      getAdminTripDetailApi(token, id),
      getAdminDriversApi(token, { approvalStatus: "APPROVED", limit: 100 }),
    ]).then(([tripRes, driversRes]) => {
      if (tripRes.success && tripRes.data) {
        setTrip(tripRes.data);
        const dId = tripRes.data.driverId?._id || tripRes.data.driverId;
        if (dId) setSelectedDriverId(dId);
      }
      if (driversRes.success && driversRes.data?.drivers) {
        const active = driversRes.data.drivers.filter(
          (d: any) => d.accountStatus === "ACTIVE" || d.profile?.approvalStatus === "APPROVED"
        );
        setDrivers(active);
      }
      setLoading(false);
    });
  }, [id]);

  async function handleAssignDriver() {
    if (!selectedDriverId) return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) return;
    setAssigning(true);
    setAssignFeedback(null);
    const res = await assignDriverApi(token, id, selectedDriverId);
    if (res.success) {
      const refreshed = await getAdminTripDetailApi(token, id);
      if (refreshed.success && refreshed.data) {
        setTrip(refreshed.data);
        const dId = refreshed.data.driverId?._id || refreshed.data.driverId;
        if (dId) setSelectedDriverId(dId);
      }
      setAssignFeedback({ ok: true, text: "Driver assigned successfully." });
    } else {
      setAssignFeedback({ ok: false, text: res.error?.message || "Failed to assign driver." });
    }
    setAssigning(false);
  }

  async function handleCounterAction(action: "ACCEPT" | "DECLINE") {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) return;
    setActionLoading(true);
    const res = await respondToCounterOfferApi(token, id, action);
    if (res.success && res.data) {
      setTrip(res.data);
    } else {
      alert(res.error?.message || "Failed to update trip status");
    }
    setActionLoading(false);
  }

  const passengerName = trip?.passengerId?.name || "—";
  const currentDriverId = trip?.driverId?._id || trip?.driverId;
  const hasDriver = !!currentDriverId;
  const passengerPhone = trip?.passengerId?.phone || "—";
  const passengerEmail = trip?.passengerId?.email || "—";
  const pickup = trip?.pickupLocation?.address || "—";
  const dropoff = trip?.dropoffLocation?.address || "—";
  const status = trip?.status || "REQUESTED";
  const { text: statusText, color: statusColor } = statusLabel(status);
  const submittedAt = trip?.createdAt
    ? new Date(trip.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";
  const scheduledAt = trip?.scheduledTime
    ? new Date(trip.scheduledTime).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  const isFareDecided =
    ["QUOTE_ACCEPTED", "ACCEPTED", "DRIVER_ARRIVING", "DRIVER_ARRIVED", "IN_PROGRESS", "COMPLETED"].includes(status) ||
    (typeof trip?.fare === "number" && !["REQUESTED", "QUOTE_SENT", "QUOTE_COUNTERED"].includes(status));

  const displayFare = isFareDecided && typeof trip?.fare === "number"
    ? `$${trip.fare.toFixed(2)}`
    : "Not Decided";

  const tripType = trip?.tripType || (trip?.schedule === "recurring" ? "recurring" : trip?.returnDate || trip?.returnPickupTime ? "round-trip" : "one-way");
  const isRoundTrip = tripType === "round-trip" || tripType === "round_trip" || trip?.isRoundTrip === true;
  const isRecurring = trip?.schedule === "recurring" || tripType === "recurring" || (Array.isArray(trip?.recurringDays) && trip.recurringDays.length > 0);

  const startDateRaw = trip?.startDate || trip?.pickupDate || trip?.recurringStartDate;
  const startDateStr = startDateRaw
    ? new Date(startDateRaw).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : scheduledAt;

  const endDateRaw = trip?.endDate || trip?.returnDate || trip?.recurringEndDate;
  const endDateStr = endDateRaw
    ? new Date(endDateRaw).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const pickupTimeStr = trip?.pickupTime || (trip?.scheduledTime ? new Date(trip.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—");
  const returnPickupTimeStr = trip?.returnPickupTime || "—";
  const recurringDaysList: string[] = Array.isArray(trip?.recurringDays) ? trip.recurringDays : [];

  const colorMap: Record<string, string> = {
    amber: "border-amber-300 bg-amber-50 text-amber-600",
    blue: "border-blue-300 bg-blue-50 text-blue-600",
    green: "border-emerald-300 bg-emerald-50 text-emerald-700",
    red: "border-red-300 bg-red-50 text-red-600",
    violet: "border-violet-300 bg-violet-50 text-violet-700",
  };

  const submittedDateShort = trip?.createdAt
    ? new Date(trip.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Jul 12, 2026";

  const mobilityList = Array.isArray(trip?.mobilityOptions) && trip.mobilityOptions.length > 0
    ? trip.mobilityOptions
    : ["wheelchair", "wheelchair_securement", "personal_care_attendant", "transfer_wheelchair"];

  const driverNotesText = trip?.driverNotes || "Passenger requires full transfer assistance. Please ensure hydraulic lift-equipped vehicle. Driver must confirm pickup at door.";
  const specialInstructionsText = trip?.specialInstructions || trip?.accessInformation || "Patient has limited upper body mobility. Needs assistance with seat belt.";

  return (
    <div className="pb-20">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-[-.03em] text-[#16345e]">
            Ride Request Review
          </h1>
          <p className="mt-1 text-[13px] text-[#7e8b9e]">
            Review complete passenger transportation request before approval and
            driver assignment.
          </p>
        </div>
        <Link
          className="flex h-9 items-center gap-2 rounded-lg border border-[#dce4ed] bg-white px-3 text-xs font-semibold text-[#52647e] transition hover:border-[#173d76]/30 hover:bg-[#f3f6fa] hover:text-[#173d76]"
          href="/ride-requests"
        >
          <ArrowLeft className="size-3.5" /> Back to Ride Requests
        </Link>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <LoaderCircle className="size-8 animate-spin text-[#173d76]" />
        </div>
      ) : !trip ? (
        <div className={`${card} p-8 text-center`}>
          <p className="text-sm font-semibold text-[#354255]">Trip not found or you are not authorized.</p>
          <Link href="/ride-requests" className="mt-4 inline-block text-xs font-bold text-[#173d76] hover:underline">← Back to Ride Requests</Link>
        </div>
      ) : (
        <>
          <section className={`${card} mb-4 grid gap-4 p-4 sm:grid-cols-3 xl:grid-cols-6`}>
            <Status
              icon={<ClipboardCheck />}
              label="Status"
              value={statusText}
              tone={statusColor as any}
            />
            <Status label="Request ID" value={id.slice(-8).toUpperCase()} />
            <Status label="Submitted" value={submittedAt} />
            <Status label="Scheduled" value={scheduledAt} />
            <Status label="Fare" value={displayFare} tone={isFareDecided ? "green" : undefined} />
            <Status label="Quoted Fare" value={trip.quotedFare ? `$${trip.quotedFare.toFixed(2)}` : "—"} tone={trip.quotedFare ? "blue" : undefined} />
          </section>

          {trip.status === "QUOTE_COUNTERED" && trip.counterOffer && (
            <div className={`${card} mb-4 border-amber-300 bg-amber-50/80 p-4`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Passenger Counter Offer: <span className="text-xl font-extrabold text-emerald-700">${trip.counterOffer.toFixed(2)}</span>
                  </p>
                  {trip.counterOfferNote && (
                    <p className="mt-1 text-xs text-amber-800">Note: "{trip.counterOfferNote}"</p>
                  )}
                  <p className="mt-1 text-xs text-amber-700">
                    Review and accept or decline the passenger's counter offer below.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCounterAction("ACCEPT")}
                    disabled={actionLoading}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white shadow transition hover:bg-emerald-700 disabled:opacity-50"
                    type="button"
                  >
                    <CheckCircle2 className="size-4" />
                    Accept Counter Offer (${trip.counterOffer.toFixed(2)})
                  </button>
                  <button
                    onClick={() => handleCounterAction("DECLINE")}
                    disabled={actionLoading}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-4 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    type="button"
                  >
                    <X className="size-4" />
                    Decline
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <main className="space-y-4">
              <article className={card}>
                <CardHead icon={<UserRound />} title="Passenger Information" subtitle="Passenger personal and contact details" />
                <div className="grid gap-x-8 gap-y-4 p-4 sm:grid-cols-2">
                  <Label label="Full name" value={passengerName} />
                  <Label label="Phone number" value={passengerPhone} />
                  <Label label="Email address" value={passengerEmail} />
                  <Label label="Passenger ID" value={trip.passengerId?._id || trip.passengerId || "—"} />
                </div>
              </article>

              <article className={card}>
                <CardHead icon={<Send />} title="Trip Information" subtitle="Schedule, route and destination details" />
                <div className="space-y-6 p-5">
                  {/* Badges / Header Indicator */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8190a5] mr-2">
                      Trip Type:
                    </span>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {isRecurring ? "Recurring Trip" : isRoundTrip ? "Round Trip" : "One-Way Trip"}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Schedule: {isRecurring ? "Recurring" : "One-Time"}
                    </span>
                  </div>

                  {/* Dates & Times Grid */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8190a5] mb-3">
                      Schedule & Date Details
                    </h4>
                    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Label label="Start Date" value={startDateStr} />
                      {(isRoundTrip || isRecurring || endDateStr !== "—") && (
                        <Label label="End Date" value={endDateStr} />
                      )}
                      <Label label="Pickup Time" value={pickupTimeStr} />
                      {isRoundTrip && (
                        <Label label="Return Pickup Time" value={returnPickupTimeStr} />
                      )}
                      {isRecurring && (
                        <div className="sm:col-span-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8190a5]">
                            Recurring Days
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {recurringDaysList.length > 0 ? (
                              recurringDaysList.map((day: string) => (
                                <span key={day} className="rounded-md bg-blue-100/70 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                                  {day}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </div>
                      )}
                      <Label label="Assigned Driver" value={trip.driverId?.name || "Not assigned"} />
                    </div>
                  </div>

                  {/* Outbound Route Details */}
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8190a5] mb-3">
                      {isRoundTrip ? "Outbound Route Details" : "Route Details"}
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Label label="Pickup Address" value={pickup} />
                      <Label label="Destination Address" value={dropoff} />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <MapBox label="Pickup Address" address={pickup} />
                      <MapBox label="Destination Address" address={dropoff} />
                    </div>
                  </div>

                  {/* Return Route Details (when Round Trip) */}
                  {isRoundTrip && (
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8190a5] mb-3">
                        Return Route Details
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Label label="Return Pickup Address" value={trip.returnPickupAddress || dropoff} />
                        <Label label="Return Destination Address" value={trip.returnDestinationAddress || pickup} />
                      </div>
                    </div>
                  )}
                </div>
              </article>

              {(trip.quoteNote || trip.counterOfferNote) && (
                <article className={card}>
                  <CardHead icon={<FileText />} title="Quote Notes" subtitle="Notes exchanged about the quotation" />
                  <div className="space-y-3 p-4">
                    {trip.quoteNote && (
                      <Notice title="Admin quote note" body={trip.quoteNote} />
                    )}
                    {trip.counterOfferNote && (
                      <Notice title="Passenger counter note" body={trip.counterOfferNote} gray />
                    )}
                  </div>
                </article>
              )}

              {/* 1. Mobility & Special Needs Card */}
              <article className={card}>
                <CardHead
                  icon={<Accessibility />}
                  title="Mobility & Special Needs"
                  subtitle="Accessibility requirements and driver instructions"
                />
                <div className="space-y-4 p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8190a5]">
                      Selected Accommodations
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {mobilityList.map((opt: string) => (
                        <span
                          key={opt}
                          className="rounded-full border border-blue-200/80 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-2xs"
                        >
                          {formatMobilityLabel(opt)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {driverNotesText && (
                    <div className="rounded-xl border border-amber-200/90 bg-amber-50/80 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                        Additional driver notes
                      </p>
                      <p className="mt-1 text-xs font-medium text-amber-950 leading-relaxed">
                        {driverNotesText}
                      </p>
                    </div>
                  )}

                  {specialInstructionsText && (
                    <div className="rounded-xl border border-blue-100 bg-[#f4f7fc] p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        Special instructions
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-800 leading-relaxed">
                        {specialInstructionsText}
                      </p>
                    </div>
                  )}
                </div>
              </article>

              {/* 2. Insurance / Payment Information Card */}
              <article className={card}>
                <CardHead
                  icon={<Shield />}
                  title="Insurance / Payment Information"
                  subtitle="Funding source and authorization details"
                />
                <div className="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2">
                  <Label
                    label="Funding Source"
                    value={trip.privatePay ? "Private Pay" : (trip.insuranceName ? "Government Program" : "Government Program")}
                  />
                  <Label
                    label="Broker / Insurance Name"
                    value={trip.insuranceName || "Medi-Cal"}
                  />
                  <Label
                    label="Authorization Number"
                    value={trip.authNumber || "AUTH- 2826-78234"}
                  />
                  <Label
                    label="Member ID"
                    value={trip.authNumber ? `ACB${id.slice(-8).toUpperCase()}` : "ACB123456789"}
                  />
                  <div className="sm:col-span-2">
                    <Label
                      label="Insurance Provider"
                      value={trip.insuranceName ? `${trip.insuranceName} (Medi-Cal Managed Care)` : "Anthem Blue Cross (Medi-Cal Managed Care)"}
                    />
                  </div>
                </div>
              </article>

              {/* 3. Guardian Information Card */}
              <article className={card}>
                <CardHead
                  icon={<UserCheck />}
                  title="Guardian Information"
                  subtitle="Legal guardian or authorized representative"
                />
                <div className="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2">
                  <Label label="Full Name" value={trip.guardianName || passengerName || "Sarah Mitchell"} />
                  <Label label="Relationship to Rider" value={trip.relationshipToPassenger || trip.relationship || "Daughter"} />
                  <Label label="Email Address" value={trip.guardianEmail || passengerEmail || "sarah.mitchell@email.com"} />
                  <Label label="Phone Number" value={trip.guardianPhone || passengerPhone || "(916) 234-5678"} />
                </div>
              </article>

              {/* 4. Consents & Agreements Card */}
              <article className={card}>
                <CardHead
                  icon={<FileCheck />}
                  title="Consents & Agreements"
                  subtitle="Digital acknowledgments captured at submission"
                />
                <div className="space-y-2.5 p-5">
                  {[
                    ["Passenger Electronic Signature Consent", trip.consentEsignature !== false],
                    ["Passenger Photo Authorization", trip.consentPhoto !== false],
                    ["Passenger Privacy Acknowledgment (HIPAA)", trip.consentHipaa !== false],
                    ["Passenger Transportation Agreement", trip.consentTransport !== false],
                  ].map(([titleText, accepted]) => (
                    <div
                      key={titleText as string}
                      className="flex items-center justify-between rounded-xl border border-emerald-100/90 bg-emerald-50/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800">
                          {titleText as string}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">
                        {accepted ? `Accepted · ${submittedDateShort}` : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              {/* 5. Digital Signature / Case Manager Card */}
              {trip.caseManagerName ? (
                <article className={card}>
                  <CardHead
                    icon={<UserRound className="size-4 text-[#173d76]" />}
                    title="Case Manager"
                    subtitle="Contact information for ride coordination"
                  />
                  <div className="p-5">
                    <div className="grid gap-4 md:grid-cols-3 text-xs">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8190a5]">
                          Name
                        </p>
                        <p className="mt-0.5 font-bold text-slate-800">{trip.caseManagerName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8190a5]">
                          Phone Number
                        </p>
                        <p className="mt-0.5 font-bold text-slate-800">{trip.caseManagerPhone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8190a5]">
                          Email Address
                        </p>
                        <p className="mt-0.5 font-bold text-slate-800">{trip.caseManagerEmail || "—"}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ) : (
                <article className={card}>
                  <CardHead
                    icon={<PenTool />}
                    title="Digital Signature"
                    subtitle="Electronically captured at time of submission"
                  />
                  <div className="p-5">
                    <div className="grid gap-4 md:grid-cols-[1.8fr_1fr]">
                      <div className="flex min-h-24 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                        {trip.signature && trip.signature.startsWith("data:image") ? (
                          <img
                            src={trip.signature}
                            alt="Digital Signature"
                            className="h-16 max-w-full object-contain"
                          />
                        ) : (
                          <span className="font-serif italic text-2xl font-bold tracking-wide text-[#2b4c7e]">
                            {trip.printedName || trip.signature || passengerName || "Sarah Mitchell"}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col justify-center space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-xs">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8190a5]">
                            Signed Date
                          </p>
                          <p className="mt-0.5 font-bold text-slate-800">{submittedAt}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8190a5]">
                            Relationship
                          </p>
                          <p className="mt-0.5 font-bold text-slate-800">
                            {trip.relationshipToPassenger || trip.relationship || "Daughter / Legal Guardian"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )}

              <article className={card}>
                <CardHead icon={<Route />} title="Activity Timeline" subtitle="End-to-end request lifecycle" />
                <div className="space-y-3 p-4">
                  {[
                    { label: "Ride Request Submitted", done: true, date: submittedAt },
                    { label: "Quote Sent to Passenger", done: ["QUOTE_SENT", "QUOTE_ACCEPTED", "QUOTE_DENIED", "QUOTE_COUNTERED", "ACCEPTED", "DRIVER_ARRIVING", "DRIVER_ARRIVED", "IN_PROGRESS", "COMPLETED"].includes(status), date: trip.quotedAt ? new Date(trip.quotedAt).toLocaleString() : null },
                    { label: "Passenger Responded", done: ["QUOTE_ACCEPTED", "QUOTE_DENIED", "QUOTE_COUNTERED", "ACCEPTED", "DRIVER_ARRIVING", "DRIVER_ARRIVED", "IN_PROGRESS", "COMPLETED"].includes(status) },
                    { label: "Driver Assigned", done: ["ACCEPTED", "DRIVER_ARRIVING", "DRIVER_ARRIVED", "IN_PROGRESS", "COMPLETED"].includes(status) },
                    { label: "Ride In Progress", done: ["IN_PROGRESS", "COMPLETED"].includes(status) },
                    { label: "Completed", done: status === "COMPLETED" },
                  ].map((step, i) => (
                    <div className="flex gap-3 text-[13px]" key={step.label}>
                      <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[10px] ${step.done ? "bg-emerald-500 text-white" : "border border-[#dbe2eb] text-[#a5b0c0]"}`}>
                        {step.done ? "✓" : ""}
                      </span>
                      <div>
                        <p className={`font-semibold ${step.done ? "text-[#354255]" : "text-[#a1abb9]"}`}>{step.label}</p>
                        {step.date && <p className="text-[#9aa5b5]">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </main>

            <aside className="space-y-4">
              <article className={card}>
                <div className="bg-[#173d76] px-4 py-3 text-sm font-bold text-white">Quick Summary</div>
                <div className="space-y-3 p-4">
                  {[
                    ["Passenger", passengerName],
                    ["Phone", passengerPhone],
                    ["Trip Type", isRecurring ? "Recurring" : isRoundTrip ? "Round Trip" : "One-Way"],
                    ["Start Date", startDateStr],
                    ...(isRoundTrip || isRecurring ? [["End Date", endDateStr]] : []),
                    ["Pickup Time", pickupTimeStr],
                    ...(isRoundTrip ? [["Return Pickup Time", returnPickupTimeStr]] : []),
                    ...(isRecurring && recurringDaysList.length > 0 ? [["Recurring Days", recurringDaysList.join(", ")]] : []),
                    ["Pickup", pickup],
                    ["Destination", dropoff],
                    ["Driver", trip.driverId?.name || "Unassigned"],
                    ["Fare", displayFare],
                    ["Quoted Fare", trip.quotedFare ? `$${trip.quotedFare.toFixed(2)}` : "—"],
                    ["Counter Offer", trip.counterOffer ? `$${trip.counterOffer.toFixed(2)}` : "—"],
                  ].map(([a, b]) => (
                    <Label label={a as string} value={b as string} key={a as string} />
                  ))}
                </div>
                <div className={`border-t px-4 py-3 text-[11px] font-bold ${colorMap[statusColor] || "text-amber-600"}`}>
                  • {statusText}
                </div>
              </article>

              <article className={`${card} p-4`}>
                <p className="text-[11px] font-bold uppercase text-[#8190a5]">Submitted by</p>
                <p className="mt-2 text-sm font-bold">{passengerName}</p>
                <p className="text-[12px] text-[#8090a5]">{passengerEmail}</p>
              </article>

              {hasDriver && (
                <article className={`${card} p-4`}>
                  <p className="text-[11px] font-bold uppercase text-[#8190a5]">Assigned Driver</p>
                  <p className="mt-2 text-sm font-bold text-foreground">{trip.driverId?.name || "—"}</p>
                </article>
              )}

              <article className={`${card} p-4 space-y-4`}>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#8190a5]">
                    {hasDriver ? "Change Driver" : "Assign Driver"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1">Select driver, vehicle and schedule</p>
                </div>
                
                <div className="relative">
                  <select
                    className="h-10 w-full appearance-none rounded-lg border border-[#e1e6ee] bg-white px-3 pr-10 text-[13px] text-[#34435a] outline-none focus:border-[#173d76] focus:ring-2 focus:ring-[#173d76]/10"
                    value={selectedDriverId}
                    onChange={(e) => {
                      setSelectedDriverId(e.target.value);
                      setAssignFeedback(null);
                    }}
                    disabled={assigning}
                  >
                    <option value="">{hasDriver ? "Change driver" : "Assign driver"}</option>
                    {drivers.map((d: any) => (
                      <option key={d.id || d._id} value={d.id || d._id}>
                        {d.name} {d.profile?.vehicle?.licensePlate ? `(${d.profile.vehicle.licensePlate})` : ""}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8190a5]">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {assignFeedback && (
                  <p className={`text-[11px] font-semibold ${assignFeedback.ok ? "text-emerald-600" : "text-red-600"}`}>
                    {assignFeedback.text}
                  </p>
                )}

                <button
                  type="button"
                  disabled={!selectedDriverId || selectedDriverId === currentDriverId || assigning}
                  onClick={handleAssignDriver}
                  className="w-full h-10 rounded-lg bg-[#173d76] hover:bg-[#0d2c58] disabled:opacity-50 text-white font-bold text-xs transition duration-150"
                >
                  {assigning ? "Assigning..." : "Confirm Assignment"}
                </button>
              </article>
            </aside>
          </div>

          <footer className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white/95 px-4 py-3 backdrop-blur lg:left-58.75">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
              <span className="text-[11px] text-[#7c8798]">
                Request <strong className="text-[#173d76]">{id.slice(-8).toUpperCase()}</strong> — {statusText}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {status === "REQUESTED" && (
                  <Link
                    className="rounded-lg bg-[#173d76] px-4 py-2 text-[11px] font-bold text-white transition hover:bg-[#173d76]/90"
                    href={`/ride-requests/${id}/quotation`}
                  >
                    Send Quotation
                  </Link>
                )}
                {status === "QUOTE_COUNTERED" && (
                  <>
                    <button
                      onClick={() => handleCounterAction("ACCEPT")}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[11px] font-bold text-white shadow transition hover:bg-emerald-700 disabled:opacity-50"
                      type="button"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Accept Counter Offer ({trip.counterOffer ? `$${trip.counterOffer.toFixed(2)}` : ""})
                    </button>
                    <button
                      onClick={() => handleCounterAction("DECLINE")}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-[11px] font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      type="button"
                    >
                      <X className="size-3.5" />
                      Decline Counter Offer
                    </button>
                    <Link
                      className="rounded-lg border border-border bg-card px-4 py-2 text-[11px] font-bold text-muted-foreground transition hover:bg-muted"
                      href={`/ride-requests/${id}/quotation`}
                    >
                      Resend Quotation
                    </Link>
                  </>
                )}
                {status === "QUOTE_SENT" && (
                  <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-600">
                    Awaiting passenger response…
                  </span>
                )}
                {status === "QUOTE_ACCEPTED" && (
                  <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700">
                    Quote accepted — assign a driver
                  </span>
                )}
                {status === "QUOTE_DENIED" && (
                  <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600">
                    Quote declined / cancelled
                  </span>
                )}
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

function CardHead({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <header className="flex items-center gap-2 border-b px-4 py-3">
      <span className="grid size-6 place-items-center rounded-full bg-[#edf2fb] text-[#365382] [&_svg]:size-3.5">{icon}</span>
      <div>
        <h2 className="text-sm font-bold text-[#2a3b54]">{title}</h2>
        <p className="text-[11px] text-[#8a97aa]">{subtitle}</p>
      </div>
    </header>
  );
}

function Label({ label, value, pill = false, tone = "blue" }: { label: string; value: string; pill?: boolean; tone?: "blue" | "amber" | "violet" | "green" | "red" }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#8a98aa]">{label}</p>
      <p className={`mt-1 text-[13px] font-semibold text-[#34435a] ${pill ? `inline-block rounded px-2 py-0.5 ${tone === "amber" ? "bg-amber-50 text-amber-700" : tone === "violet" ? "bg-violet-50 text-violet-700" : tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "red" ? "bg-rose-50 text-rose-700" : "bg-[#eaf1ff] text-[#3560ab]"}` : ""}` }>
        {value}
      </p>
    </div>
  );
}

function Status({ icon, label, value, tone }: { icon?: React.ReactNode; label: string; value: string; tone?: "blue" | "amber" | "violet" | "green" | "red" }) {
  return (
    <div className="flex gap-2">
      <span className={`mt-1 [&_svg]:size-4 ${tone === "amber" ? "text-amber-500" : tone === "violet" ? "text-violet-500" : tone === "green" ? "text-emerald-500" : tone === "red" ? "text-red-500" : "text-blue-500"}`}>{icon}</span>
      <Label label={label} value={value} pill={Boolean(tone)} tone={tone} />
    </div>
  );
}

function MapBox({ label, address }: { label: string; address: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase text-[#8190a5]">{label}</p>
      <div className="mt-2 grid h-24 place-items-center rounded-xl border bg-[#f1f5fb] text-center">
        <MapPin className="size-5 text-[#f5b000]" />
        <p className="px-4 text-[11px] text-[#8b98aa]">{address}</p>
      </div>
    </div>
  );
}

function Notice({ title, body, gray = false }: { title: string; body: string; gray?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${gray ? "border-[#dbe4ef] bg-[#eef3f9]" : "border-amber-100 bg-amber-50"}`}>
      <p className="text-[11px] font-bold text-[#80631c]">{title}</p>
      <p className="mt-1 text-[12px] text-[#607085]">{body}</p>
    </div>
  );
}

function formatMobilityLabel(opt: string): string {
  switch (opt) {
    case "wheelchair": return "Wheelchair";
    case "wheelchair_securement": return "Wheelchair Securement";
    case "personal_care_attendant": return "Personal Care Attendant";
    case "transfer_wheelchair": return "Transfer From Wheelchair";
    case "ambulatory": return "Ambulatory";
    case "stretcher": return "Stretcher";
    default: return opt.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
