"use client";

import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Check,
  Clock3,
  DollarSign,
  Info,
  Mail,
  MapPin,
  Phone,
  Star,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const rideHistory = [
  [
    "Jul 27",
    "TRP-1001",
    "Maria Chen",
    "Standard",
    "123 Main St",
    "Miami Airport",
    "$3",
  ],
  [
    "Jul 27",
    "TRP-1002",
    "James Wilson",
    "Express",
    "45 Park Ave",
    "Brickell City",
    "$3",
  ],
  [
    "Jul 26",
    "TRP-1003",
    "Sarah Johnson",
    "Standard",
    "789 Oak Blvd",
    "Wynwood Arts",
    "$3",
  ],
  [
    "Jul 26",
    "TRP-1004",
    "Robert Davis",
    "Standard",
    "321 Elm St",
    "Coral Gables",
    "$3",
  ],
  [
    "Jul 25",
    "TRP-1005",
    "Emily Martinez",
    "Express",
    "654 Pine Rd",
    "South Beach",
    "$3",
  ],
];

import { useEffect } from "react";
import { getAdminDriversApi } from "@/lib/api";

export function DriverDetailPage({ driverId }: { driverId: string }) {
  const [tab, setTab] = useState<"profile" | "earnings">("profile");
  const [shift, setShift] = useState("Morning");
  const [liveDriver, setLiveDriver] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      if (token) {
        getAdminDriversApi(token).then((res) => {
          if (res.success && res.data && Array.isArray(res.data.drivers)) {
            const found = res.data.drivers.find(
              (d: any) => d._id === driverId || d.driverId === driverId
            ) || res.data.drivers[0];
            if (found) {
              setLiveDriver(found);
            }
          }
        });
      }
    }
  }, [driverId]);

  const assignedVehicleText = liveDriver?.vehicle
    ? `${liveDriver.vehicle.model || liveDriver.vehicle.make || "BMW X5"} — ${liveDriver.vehicle.licensePlate || "9988-12345"}`
    : "BMW X5 — 9988-12345";

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-[#16345e]">
              Driver details
            </h1>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
              <Check className="size-3.5" />
              Active
            </span>
          </div>
          <p className="mt-1 text-sm">
            <strong className="text-foreground">{liveDriver?.userId?.name || "Marcus Williams"}</strong>
            <span className="text-muted-foreground">
              {" "}
              · {driverId} · Morning shift
            </span>
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
        <button
          className={`relative px-5 py-3 text-sm font-bold ${tab === "profile" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => setTab("profile")}
          type="button"
        >
          Driver profile
          {tab === "profile" ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
          ) : null}
        </button>
        <button
          className={`relative px-5 py-3 text-sm font-bold ${tab === "earnings" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => setTab("earnings")}
          type="button"
        >
          Earnings
          {tab === "earnings" ? (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
          ) : null}
        </button>
      </div>

      {tab === "profile" ? (
        <ProfileTab driverId={driverId} shift={shift} setShift={setShift} assignedVehicleText={assignedVehicleText} driverName={liveDriver?.userId?.name} />
      ) : (
        <EarningsTab />
      )}
    </div>
  );
}

function ProfileTab({
  driverId,
  setShift,
  shift,
  assignedVehicleText,
  driverName,
}: {
  driverId: string;
  setShift: (value: string) => void;
  shift: string;
  assignedVehicleText: string;
  driverName?: string;
}) {
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className={`${cardClass} xl:sticky xl:top-24`}>
        <div className="text-center">
          <span className="mx-auto grid size-24 place-items-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground">
            {driverName ? driverName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) : "MW"}
          </span>
          <h2 className="mt-5 text-xl font-bold text-foreground">
            {driverName || "Marcus Williams"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{driverId}</p>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
            <Check className="size-3" />
            Active
          </span>
        </div>
        <div className="mt-6 space-y-3 border-t border-border pt-5">
          <Contact icon={Phone} value="+1 (555) 123-4567" />
          <Contact icon={Mail} value="marcus.w@fiki.app" />
          <Contact icon={MapPin} value="Zone B — Central District" />
          <Contact icon={CarFront} value={assignedVehicleText} />
          <Contact icon={Clock3} value={`${shift} shift`} />
        </div>
      </aside>
      <div className="space-y-5">
        <InformationCard
          title="Personal information"
          items={[
            ["Full name", driverName || "Marcus Williams"],
            ["Driver ID", driverId],
            ["Phone number", "+1 (555) 123-4567"],
            ["Email address", "marcus.w@fiki.app"],
            ["Date of birth", "Aug 14, 1992"],
            ["Address", "142 Westside Ave, Chicago, IL"],
          ]}
        />
        <InformationCard
          title="Employment details"
          items={[
            ["Driver license no.", "IL-DL-8821-4920"],
            ["License expiry", "Mar 20, 2028"],
            ["Join date", "Mar 12, 2024"],
            ["Employment status", "Full-time"],
            ["Assigned vehicle", assignedVehicleText],
            ["Assigned area", "Zone B — Central"],
          ]}
        />
        <section className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className={sectionTitle}>Shift information</h2>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-4" />
              Weekly roster
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Morning", "Evening", "Night"].map((item) => (
              <button
                className={`rounded-xl border px-4 py-4 text-sm font-bold transition ${shift === item ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}
                key={item}
                onClick={() => setShift(item)}
                type="button"
              >
                {item}
                <span className="mt-1 block text-[10px] font-medium opacity-75">
                  {item === "Morning"
                    ? "7:00 AM – 3:00 PM"
                    : item === "Evening"
                      ? "3:00 PM – 11:00 PM"
                      : "11:00 PM – 7:00 AM"}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function EarningsTab() {
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground"
          type="button"
        >
          <CalendarDays className="size-4" />
          Jul 14 – Jul 27, 2026
        </button>
      </div>
      <section className="relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground shadow-[0_8px_22px_rgba(8,37,82,0.12)] sm:p-7">
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary-foreground/5" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground/50">
              Estimated gross earnings
            </p>
            <p className="mt-3 text-4xl font-bold tracking-[-0.04em] text-secondary sm:text-5xl">
              $1,240.00
            </p>
            <p className="mt-3 text-xs text-primary-foreground/55">
              Current pay period · Jul 14 – Jul 27, 2026
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-foreground/8 px-3 py-2 text-xs">
              <span className="size-2 rounded-full bg-emerald-400" />
              Expected pay date: <strong>Jul 31, 2026</strong>
            </span>
          </div>
          <div className="border-primary-foreground/10 lg:border-l lg:pl-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground/50">
              Payroll status
            </p>
            <div className="mt-5 space-y-4">
              <PayrollStep done label="Approved" />
              <PayrollStep label="Entered into payroll" />
              <PayrollStep label="Waiting deposit" />
              <PayrollStep label="Paid" />
            </div>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <EarningMetric icon={DollarSign} label="Hourly rate" value="$14/hr" />
        <EarningMetric icon={Clock3} label="Approved hours" value="80 hrs" />
        <EarningMetric icon={CarFront} label="Completed trips" value="40" />
        <EarningMetric icon={Star} label="Trip bonus" value="40 × $3" />
        <EarningMetric
          icon={WalletCards}
          label="Total salary"
          value="$1,240.00"
        />
      </section>
      <section className={cardClass}>
        <h2 className={sectionTitle}>Earnings breakdown</h2>
        <div className="mt-5 divide-y divide-border">
          <Breakdown
            label="Regular wages"
            detail="80 hrs × $14/hr"
            value="$1,120.00"
          />
          <Breakdown
            label="Trip bonus"
            detail="40 trips × $3.00"
            value="$120.00"
          />
          <Breakdown
            label="Gross earnings"
            detail="Current pay period total"
            value="$1,240.00"
            highlight
          />
        </div>
      </section>
      <section className="overflow-hidden rounded-xl border border-[#e1e6ee] bg-card shadow-[0_4px_14px_rgba(15,37,74,.04)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <h2 className={sectionTitle}>Ride history</h2>
          <span className="text-[10px] text-muted-foreground">
            20 rides this period
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-210 text-left text-xs">
            <thead>
              <tr className="bg-muted/55 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                <th className="px-5 py-3">Date</th>
                <th>Trip ID</th>
                <th>Passenger</th>
                <th>Type</th>
                <th>Pickup</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Bonus</th>
              </tr>
            </thead>
            <tbody>
              {rideHistory.map((ride) => (
                <tr className="border-t border-border" key={ride[1]}>
                  {ride.map((value, index) => (
                    <td
                      className={`py-3.5 ${index === 0 ? "px-5" : ""} ${index === 1 ? "font-bold text-blue-600" : "text-muted-foreground"}`}
                      key={value}
                    >
                      {index === 6 ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                          Completed
                        </span>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <aside className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs leading-5 text-blue-700">
        <Info className="size-4 shrink-0" />
        <p>
          <strong>Payroll disclaimer:</strong> Earnings are estimated and
          subject to final payroll processing. Contact your payroll coordinator
          with discrepancies.
        </p>
      </aside>
    </div>
  );
}

const cardClass =
  "rounded-xl border border-[#e1e6ee] bg-card p-5 shadow-[0_4px_14px_rgba(15,37,74,.04)] sm:p-5";
const sectionTitle =
  "text-sm font-bold uppercase tracking-[0.04em] text-primary";

function Contact({ icon: Icon, value }: { icon: typeof Phone; value: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-brand-label">
      <span className="grid size-8 place-items-center rounded-full bg-muted text-brand-icon">
        <Icon className="size-4" />
      </span>
      {value}
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
function PayrollStep({
  done = false,
  label,
}: {
  done?: boolean;
  label: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 text-xs ${done ? "font-bold text-primary-foreground" : "text-primary-foreground/35"}`}
    >
      <span
        className={`grid size-5 place-items-center rounded-full border ${done ? "border-emerald-400 bg-emerald-400 text-primary" : "border-primary-foreground/25"}`}
      >
        {done ? <Check className="size-3" /> : null}
      </span>
      {label}
    </div>
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
function Breakdown({
  detail,
  highlight = false,
  label,
  value,
}: {
  detail: string;
  highlight?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-xs font-bold text-foreground">{label}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{detail}</p>
      </div>
      <strong
        className={
          highlight ? "text-lg text-secondary" : "text-sm text-foreground"
        }
      >
        {value}
      </strong>
    </div>
  );
}
