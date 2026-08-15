"use client";

import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LoaderCircle,
  MapPin,
  Route,
  Send,
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
      if (tripRes.success && tripRes.data) setTrip(tripRes.data);
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
      if (refreshed.success && refreshed.data) setTrip(refreshed.data);
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

  const colorMap: Record<string, string> = {
    amber: "border-amber-300 bg-amber-50 text-amber-600",
    blue: "border-blue-300 bg-blue-50 text-blue-600",
    green: "border-emerald-300 bg-emerald-50 text-emerald-700",
    red: "border-red-300 bg-red-50 text-red-600",
    violet: "border-violet-300 bg-violet-50 text-violet-700",
  };

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
            <Status label="Fare" value={trip.fare ? `$${trip.fare.toFixed(2)}` : "—"} />
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
                <div className="grid gap-4 p-4 md:grid-cols-2">
                  <Label value={pickup} label="Pickup address" />
                  <Label value={dropoff} label="Destination address" />
                  <Label value={scheduledAt} label="Scheduled time" />
                  <Label value={trip.driverId?.name || "Not assigned"} label="Assigned driver" />
                </div>
                <div className="border-t p-4">
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    <MapBox label="Pickup address" address={pickup} />
                    <MapBox label="Destination address" address={dropoff} />
                  </div>
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

              <article className={card}>
                <CardHead icon={<Route />} title="Activity Timeline" subtitle="End-to-end request lifecycle" />
                <div className="space-y-3 p-4">
                  {[
                    { label: "Ride Request Submitted", done: true, date: submittedAt },
                    { label: "Quote Sent to Passenger", done: ["QUOTE_SENT", "QUOTE_ACCEPTED", "QUOTE_DENIED", "QUOTE_COUNTERED", "ACCEPTED", "DRIVER_ARRIVING", "DRIVER_ARRIVED", "IN_PROGRESS", "COMPLETED"].includes(status), date: trip.quotedAt ? new Date(trip.quotedAt).toLocaleString() : null },
                    { label: "Passenger Responded", done: ["QUOTE_ACCEPTED", "QUOTE_DENIED", "QUOTE_COUNTERED"].includes(status) },
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
                    ["Pickup", pickup],
                    ["Destination", dropoff],
                    ["Scheduled", scheduledAt],
                    ["Driver", trip.driverId?.name || "Unassigned"],
                    ["Fare", trip.fare ? `$${trip.fare.toFixed(2)}` : "—"],
                    ["Quoted Fare", trip.quotedFare ? `$${trip.quotedFare.toFixed(2)}` : "—"],
                    ["Counter Offer", trip.counterOffer ? `$${trip.counterOffer.toFixed(2)}` : "—"],
                  ].map(([a, b]) => (
                    <Label label={a} value={b} key={a} />
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

              {/* Assign Driver */}
              {!["COMPLETED", "CANCELLED", "QUOTE_DENIED"].includes(status) && (
                <article className={card}>
                  <div className="flex items-center gap-2 border-b px-4 py-3">
                    <span className="grid size-6 place-items-center rounded-full bg-[#edf2fb] text-[#365382]">
                      <UserPlus className="size-3.5" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-[#2a3b54]">Assign Driver</h2>
                      <p className="text-[11px] text-[#8a97aa]">Select an active driver for this trip</p>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    {trip.driverId?.name && (
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                        <div>
                          <p className="text-[11px] font-bold text-emerald-700">Currently assigned</p>
                          <p className="text-[12px] font-semibold text-[#354255]">{trip.driverId.name}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#8190a5]" htmlFor="driver-select">
                        Select driver
                      </label>
                      <select
                        id="driver-select"
                        className="mt-1.5 h-10 w-full rounded-lg border border-[#dce5f0] bg-white px-3 text-[13px] text-[#354255] outline-none focus:border-[#173d76] focus:ring-2 focus:ring-[#173d76]/10"
                        value={selectedDriverId}
                        onChange={(e) => { setSelectedDriverId(e.target.value); setAssignFeedback(null); }}
                        disabled={assigning}
                      >
                        <option value="">— Choose a driver —</option>
                        {drivers.map((d: any) => (
                          <option key={d.id || d._id} value={d.id || d._id}>
                            {d.name}
                            {d.profile?.vehicle?.licensePlate ? ` (${d.profile.vehicle.licensePlate})` : ""}
                          </option>
                        ))}
                      </select>
                      {drivers.length === 0 && (
                        <p className="mt-1.5 text-[11px] text-[#8090a5]">No active drivers found.</p>
                      )}
                    </div>
                    {assignFeedback && (
                      <p className={`text-[11px] font-semibold ${assignFeedback.ok ? "text-emerald-600" : "text-red-600"}`}>
                        {assignFeedback.text}
                      </p>
                    )}
                    <button
                      onClick={handleAssignDriver}
                      disabled={!selectedDriverId || assigning}
                      className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#173d76] text-xs font-bold text-white transition hover:bg-[#0d2c58] disabled:opacity-50"
                      type="button"
                    >
                      {assigning ? (
                        <><LoaderCircle className="size-3.5 animate-spin" /> Assigning…</>
                      ) : (
                        <><UserPlus className="size-3.5" /> Confirm Assignment</>
                      )}
                    </button>
                  </div>
                </article>
              )}
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
