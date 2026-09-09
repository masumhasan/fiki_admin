"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { getAdminTripDetailApi } from "@/lib/api";

const card = "overflow-hidden rounded-xl border border-[#e1e6ee] bg-white shadow-[0_4px_14px_rgba(15,37,74,.04)]";

export default function TripLegsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getAdminTripDetailApi(token, id).then((tripRes) => {
      if (tripRes.success && tripRes.data) {
        setTrip(tripRes.data);
      }
      setLoading(false);
    });
  }, [id]);

  const childTrips: any[] = Array.isArray(trip?.childTrips) ? trip.childTrips : [];
  const totalCompletedTrips = trip?.totalCompletedTrips || 0;
  const effectiveFare = trip?.quotedFare ?? trip?.fare ?? 0;
  const billableFare = totalCompletedTrips * effectiveFare;

  return (
    <div className="pb-20">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-[-.03em] text-[#16345e]">
            Trip Legs & Real-Time Status
          </h1>
          <p className="mt-1 text-[13px] text-[#7e8b9e]">
            Review all trip legs and their real-time execution statuses for this request.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className="flex h-9 items-center gap-2 rounded-lg border border-[#dce4ed] bg-white px-3 text-xs font-semibold text-[#52647e] transition hover:border-[#173d76]/30 hover:bg-[#f3f6fa] hover:text-[#173d76]"
            href={`/ride-requests/${id}`}
          >
            <ArrowLeft className="size-3.5" /> Back to Ride Request
          </Link>
        </div>
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
        <div className="space-y-6">
          <section className={`${card} grid gap-4 p-4 grid-cols-1 md:grid-cols-2`}>
             <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#f8fafc] border border-slate-100">
               <span className="text-xs font-semibold uppercase tracking-wider text-[#8190a5]">Billable Fare</span>
               <span className="text-xl font-bold text-emerald-600">${billableFare.toFixed(2)}</span>
               <span className="text-[10px] font-medium text-slate-500">
                 {totalCompletedTrips} completed trip{totalCompletedTrips !== 1 ? "s" : ""} × ${effectiveFare.toFixed(2)}
               </span>
             </div>
          </section>

          <section className={`${card} p-5`}>
            {childTrips.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {childTrips.map((leg: any, idx: number) => {
                  const legTitle = leg.legType === "RETURN" || leg.isReturnLeg ? "Return Leg" : "Outbound Leg";
                  const legStatus = leg.status || "ACCEPTED";
                  const isCompleted = legStatus === "COMPLETED";
                  const isLegActive = ["IN_PROGRESS", "DRIVER_ARRIVING", "DRIVER_ARRIVED"].includes(legStatus);
                  const isCancelled = legStatus === "CANCELLED" || legStatus === "QUOTE_DENIED";
                  const badgeBg = isCompleted
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : isLegActive
                    ? "bg-blue-100 text-blue-800 border-blue-300 animate-pulse"
                    : isCancelled
                    ? "bg-red-100 text-red-800 border-red-300"
                    : "bg-slate-100 text-slate-800 border-slate-300";

                  const driverName = leg.driverId?.fullName || leg.driverId?.name || "Unassigned";

                  return (
                    <div key={leg._id || idx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-slate-900">{legTitle}</span>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeBg}`}>
                          {legStatus}
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-600">
                        <div><span className="font-semibold text-slate-500">Date & Time: </span>{leg.pickupDate || leg.startDate || "—"} {leg.pickupTime ? `at ${leg.pickupTime}` : ""}</div>
                        <div><span className="font-semibold text-slate-500">Driver: </span>{driverName}</div>
                        {leg.completedAt && <div><span className="font-semibold text-emerald-700">Completed: </span>{new Date(leg.completedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>}
                        {leg.cancellationReason && <div><span className="font-semibold text-rose-600">Note: </span>{leg.cancellationReason}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No generated trip legs found.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
