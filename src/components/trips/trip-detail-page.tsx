"use client";

import {
  ArrowLeft,
  CarFront,
  Check,
  CircleUserRound,
  Download,
  FileCheck2,
  FileText,
  type LucideIcon,
  MapPin,
  Printer,
  Star,
  UserRoundCog,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const timeline = [
  { label: "Driver en route to pickup", time: "8:55 AM", done: true },
  { label: "Arrived at pickup — waiting", time: "9:02 AM", done: true },
  { label: "Passenger boarded — trip started", time: "9:06 AM", done: true },
  { label: "Estimated arrival at destination", time: "~9:28 AM", done: false },
  { label: "Trip completed — passenger dropped", time: "—", done: false },
];

const activity = [
  {
    label: "Trip confirmed",
    time: "Jul 15, 8:50 AM",
    icon: Check,
    tone: "bg-emerald-50 text-emerald-500",
  },
  {
    label: "Driver assigned: Marcus W.",
    time: "Jul 15, 8:45 AM",
    icon: CircleUserRound,
    tone: "bg-blue-50 text-blue-500",
  },
  {
    label: "Ride request approved",
    time: "Jul 15, 8:30 AM",
    icon: FileCheck2,
    tone: "bg-slate-100 text-primary",
  },
  {
    label: "Request submitted",
    time: "Jul 14, 3:22 PM",
    icon: FileText,
    tone: "bg-slate-100 text-brand-muted",
  },
];

export function TripDetailPage({ tripId }: { tripId: string }) {
  const [cancelled, setCancelled] = useState(false);

  function exportTrip() {
    const content = JSON.stringify(
      {
        tripId,
        passenger: "Sarah Johnson",
        driver: "Marcus Williams",
        pickup: "123 Oak Avenue",
        destination: "City Medical Center",
        status: cancelled ? "Cancelled" : "Onboard",
      },
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([content], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tripId}-details.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="flex h-9 w-fit items-center gap-2 rounded-lg border border-[#dce4ed] bg-white px-3 text-xs font-semibold text-[#52647e] transition hover:border-[#173d76]/30 hover:bg-[#f3f6fa] hover:text-[#173d76]"
          href="/trips"
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
          <ToolbarButton icon={UserRoundCog} label="Reassign driver" />
          <button
            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-red-400 px-3 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
            disabled={cancelled}
            onClick={() => setCancelled(true)}
            type="button"
          >
            <X className="size-4" />
            {cancelled ? "Ride cancelled" : "Cancel ride"}
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-[#e1e6ee] bg-card p-5 shadow-[0_4px_14px_rgba(15,37,74,.04)] sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-[-0.035em] text-foreground sm:text-[28px]">
            Trip {tripId}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${cancelled ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}
          >
            {cancelled ? "Cancelled" : "Onboard"}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Today · 9:00 AM · 123 Oak Avenue → City Medical Center
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <PersonCard avatar="SJ" label="Passenger" name="Sarah Johnson">
          <p>(555) 234-5678</p>
          <p>sarah.j@email.com</p>
        </PersonCard>
        <PersonCard avatar="MW" dark label="Driver" name="Marcus Williams">
          <p>(555) 123-4567</p>
          <p className="flex items-center gap-1 font-bold text-foreground">
            <Star className="size-3.5 fill-secondary text-secondary" /> 4.9
            <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
              Active
            </span>
          </p>
        </PersonCard>
        <article className={cardClass}>
          <p className={eyebrowClass}>Vehicle</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-500">
              <CarFront className="size-6" />
            </span>
            <div>
              <h2 className="font-bold text-foreground">Toyota Sienna</h2>
              <p className="mt-1 text-xs text-muted-foreground">FKT-1234</p>
            </div>
          </div>
        </article>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,0.75fr)]">
        <div className="space-y-5">
          <section className={cardClass}>
            <h2 className={titleClass}>Route details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <RoutePoint
                label="Pickup"
                location="123 Oak Avenue"
                meta="9:00 AM · Today"
                pickup
              />
              <RoutePoint
                label="Drop-off"
                location="City Medical Center"
                meta="Est. arrival 9:28 AM"
              />
            </div>
          </section>
          <section className="grid gap-4 sm:grid-cols-2">
            <NoteCard title="Driver notes">
              Passenger requires extra assistance. Vehicle is clean and ready.
              Will arrive 5 min early.
            </NoteCard>
            <NoteCard title="Customer notes">
              Requires wheelchair accessible vehicle. Please arrive 5 minutes
              early. Call on arrival.
            </NoteCard>
          </section>
        </div>

        <aside className="space-y-5">
          <section className={cardClass}>
            <h2 className={titleClass}>Trip timeline</h2>
            <ol className="mt-5">
              {timeline.map((item, index) => (
                <li
                  className="relative flex gap-3 pb-5 last:pb-0"
                  key={item.label}
                >
                  {index < timeline.length - 1 ? (
                    <span
                      className={`absolute left-[13px] top-7 h-full w-px ${item.done ? "bg-primary" : "bg-border"}`}
                    />
                  ) : null}
                  <span
                    className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-[10px] ${item.done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-brand-soft"}`}
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

          <section className={cardClass}>
            <h2 className={titleClass}>Ride activity</h2>
            <div className="mt-5 space-y-4">
              {activity.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="flex gap-3" key={item.label}>
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-lg ${item.tone}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 text-[10px] text-brand-placeholder">
                        {item.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
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
