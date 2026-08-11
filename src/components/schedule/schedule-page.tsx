"use client";

import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListFilter,
  Moon,
  Pencil,
  Plus,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";

const drivers = [
  {
    initials: "JR",
    name: "John Rivera",
    id: "DRV-0421",
    tone: "bg-blue-600",
    total: "40h 00m",
    shifts: [
      "8:00 AM|4:00 PM|normal",
      "8:00 AM|4:00 PM|normal",
      "9:00 AM|5:00 PM|change",
      "8:00 AM|4:00 PM|normal",
      "8:00 AM|4:00 PM|normal",
      "off",
      "off",
    ],
  },
  {
    initials: "AS",
    name: "Ahmed Smith",
    id: "DRV-0312",
    tone: "bg-emerald-500",
    total: "40h 00m",
    shifts: [
      "7:00 AM|3:00 PM|normal",
      "7:00 AM|3:00 PM|normal",
      "7:00 AM|3:00 PM|normal",
      "8:00 AM|4:00 PM|change",
      "7:00 AM|3:00 PM|normal",
      "off",
      "off",
    ],
  },
  {
    initials: "MJ",
    name: "Maria Johnson",
    id: "DRV-0198",
    tone: "bg-violet-500",
    total: "32h 00m",
    shifts: [
      "9:00 AM|5:00 PM|normal",
      "off",
      "9:00 AM|5:00 PM|normal",
      "9:00 AM|5:00 PM|normal",
      "9:00 AM|5:00 PM|normal",
      "off",
      "off",
    ],
  },
  {
    initials: "CM",
    name: "Carlos Mendez",
    id: "DRV-0554",
    tone: "bg-amber-500",
    total: "40h 00m",
    shifts: [
      "6:00 AM|2:00 PM|normal",
      "6:00 AM|2:00 PM|normal",
      "6:00 AM|2:00 PM|issue",
      "6:00 AM|2:00 PM|normal",
      "6:00 AM|2:00 PM|normal",
      "off",
      "off",
    ],
  },
  {
    initials: "SW",
    name: "Sarah Williams",
    id: "DRV-0677",
    tone: "bg-red-500",
    total: "24h 00m",
    shifts: [
      "off",
      "10:00 AM|6:00 PM|normal",
      "10:00 AM|6:00 PM|normal",
      "10:00 AM|6:00 PM|issue",
      "10:00 AM|6:00 PM|normal",
      "off",
      "off",
    ],
  },
] as const;

const days = [
  ["Mon", "Jul 14"],
  ["Tue", "Jul 15"],
  ["Wed", "Jul 16"],
  ["Thu", "Jul 17"],
  ["Fri", "Jul 18"],
  ["Sat", "Jul 19"],
  ["Sun", "Jul 20"],
] as const;

import { useEffect } from "react";
import { getAdminDriversApi } from "@/lib/api";

export function SchedulePage() {
  const [liveDrivers, setLiveDrivers] = useState<any[] | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("fiki_auth_token");
      if (token) {
        getAdminDriversApi(token).then((res) => {
          if (res.success && res.data && Array.isArray(res.data.drivers)) {
            const mapped = res.data.drivers.map((d: any, idx: number) => {
              const nameParts = (d.name || "Driver").split(" ");
              const initials = nameParts.length >= 2
                ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                : (d.name || "DR").substring(0, 2).toUpperCase();
              const colors = ["bg-blue-600", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-red-500"];
              return {
                initials,
                name: d.name || "Driver",
                id: `DRV-${String(idx + 1).padStart(4, "0")}`,
                tone: colors[idx % colors.length],
                total: "40h 00m",
                shifts: [
                  "8:00 AM|4:00 PM|normal",
                  "8:00 AM|4:00 PM|normal",
                  "9:00 AM|5:00 PM|change",
                  "8:00 AM|4:00 PM|normal",
                  "8:00 AM|4:00 PM|normal",
                  "off",
                  "off",
                ],
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
  const [selected, setSelected] = useState(activeDriverList[0]);

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="Schedule"
        description="Plan driver coverage and resolve schedule conflicts."
      />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric
          icon={CalendarDays}
          label="Drivers scheduled today"
          value={String(activeDriverList.length)}
          tone="bg-blue-50 text-blue-600"
        />
        <Metric
          icon={UsersRound}
          label="Drivers working now"
          value={String(activeDriverList.length)}
          tone="bg-emerald-50 text-emerald-600"
        />
        <Metric
          icon={Clock3}
          label="Drivers off today"
          value="0"
          tone="bg-violet-50 text-violet-600"
        />
        <Metric
          icon={AlertTriangle}
          label="Schedule issues"
          value="0"
          tone="bg-amber-50 text-amber-600"
        />
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="space-y-4 border-b border-border p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Weekly schedule overview</h2>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button className={iconButton} type="button">
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-xs font-semibold">
                  Jul 14 – Jul 20, 2026
                </span>
                <button className={iconButton} type="button">
                  <ChevronRight className="size-4" />
                </button>
                <button
                  className="rounded-lg border border-border px-3 py-2 text-xs font-bold"
                  type="button"
                >
                  Today
                </button>
                <button className={filterButton} type="button">
                  <UsersRound className="size-4" />
                  All drivers
                  <ChevronDown className="size-3" />
                </button>
                <button className={filterButton} type="button">
                  <ListFilter className="size-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-230">
              <div className="grid grid-cols-[180px_repeat(7,1fr)_90px] items-center border-b border-border bg-muted/30 px-5 py-3 text-center text-xs font-bold uppercase text-muted-foreground">
                <span className="text-left">Driver</span>
                {days.map(([day, date]) => (
                  <span key={day}>
                    {day}
                    <small className="mt-1 block font-normal normal-case text-brand-soft">
                      {date}
                    </small>
                  </span>
                ))}
                <span>Total</span>
              </div>
              {activeDriverList.map((driver) => (
                <div
                  className={`grid grid-cols-[180px_repeat(7,1fr)_90px] items-center gap-2 border-b border-border px-5 py-3 last:border-0 ${selected.id === driver.id ? "bg-blue-50/30" : ""}`}
                  key={driver.id}
                >
                  <button
                    className="flex items-center gap-3 text-left"
                    onClick={() => setSelected(driver)}
                    type="button"
                  >
                    <span
                      className={`grid size-8 place-items-center rounded-full text-[10px] font-bold text-white ${driver.tone}`}
                    >
                      {driver.initials}
                    </span>
                    <span>
                      <strong className="block text-xs">{driver.name}</strong>
                      <small className="text-[10px] text-muted-foreground">
                        {driver.id}
                      </small>
                    </span>
                  </button>
                  {driver.shifts.map((shift: string, index: number) => (
                    <ShiftCell key={days[index][0]} shift={shift} />
                  ))}
                  <strong className="text-center text-xs">
                    {driver.total}
                  </strong>
                </div>
              ))}
              <div className="flex flex-wrap gap-5 px-6 py-4 text-[10px] text-muted-foreground">
                <Legend
                  tone="bg-emerald-100 border-emerald-300"
                  label="Scheduled"
                />
                <Legend
                  tone="bg-blue-100 border-blue-300"
                  label="One-time change"
                />
                <Legend tone="bg-slate-100 border-slate-200" label="Day off" />
                <Legend
                  tone="bg-amber-100 border-amber-300"
                  label="Schedule issue"
                />
              </div>
            </div>
          </div>
        </article>

        <aside className="space-y-5">
          <article className={cardClass}>
            <div className="flex items-center gap-3 rounded-xl border border-border p-3">
              <span
                className={`grid size-9 place-items-center rounded-full text-xs font-bold text-white ${selected.tone}`}
              >
                {selected.initials}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-xs">
                  {selected.name}
                </strong>
                <span className="text-[10px] text-muted-foreground">
                  {selected.id}
                </span>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-5 flex justify-between">
              <h3 className="text-sm font-bold">Current schedule</h3>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                ● Active
              </span>
            </div>
            <div className="mt-3 divide-y divide-border">
              {[
                ["Work days", "Mon – Fri"],
                ["Start time", "8:00 AM"],
                ["End time", "4:00 PM"],
                ["Daily hours", "8h 00m"],
                ["Effective date", "Jun 30, 2026"],
              ].map(([label, value]) => (
                <div className="flex justify-between py-3 text-xs" key={label}>
                  <span className="text-muted-foreground">{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </article>
          <article className={cardClass}>
            <h3 className="text-sm font-bold">Quick actions</h3>
            <div className="mt-4 space-y-2">
              <Action icon={Pencil} label="Edit schedule" />
              <Action icon={Plus} label="Add one-time change" />
              <Action icon={Moon} label="Add day off" />
              <Action danger icon={Trash2} label="Remove schedule" />
            </div>
          </article>
        </aside>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-start justify-between p-5">
            <div>
              <h2 className="text-base font-bold">Upcoming one-time changes</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Scheduled changes for this week
              </p>
            </div>
            <button className="text-xs font-bold text-blue-600" type="button">
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-170 text-left text-xs">
              <thead className="bg-muted/50 text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Driver</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Reason</th>
                  <th>Created by</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "AS",
                    "Ahmed Smith",
                    "Jul 17, 2026",
                    "8:00 AM",
                    "4:00 PM",
                    "Training",
                  ],
                  [
                    "MJ",
                    "Maria Johnson",
                    "Jul 15, 2026",
                    "9:00 AM",
                    "1:00 PM",
                    "Doctor appointment",
                  ],
                ].map(([initials, name, date, start, end, reason]) => (
                  <tr className="border-t border-border" key={name}>
                    <td className="px-5 py-4 font-semibold">
                      <span className="mr-2 inline-grid size-7 place-items-center rounded-full bg-emerald-500 text-[9px] text-white">
                        {initials}
                      </span>
                      {name}
                    </td>
                    <td>{date}</td>
                    <td>{start}</td>
                    <td>{end}</td>
                    <td>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] text-blue-600">
                        {reason}
                      </span>
                    </td>
                    <td className="text-muted-foreground">John Rivera</td>
                    <td>
                      <button className="mr-3 text-blue-600" type="button">
                        <Pencil className="size-4" />
                      </button>
                      <button className="text-red-500" type="button">
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="text-base font-bold">Schedule issues</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Requires your attention
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">
              2 active
            </span>
          </div>
          {[
            [
              "Carlos Mendez",
              "Shift overlap detected on Wednesday — conflicts with vehicle maintenance window.",
            ],
            [
              "Sarah Williams",
              "Missing attendance confirmation for Thursday’s scheduled shift.",
            ],
          ].map(([name, note]) => (
            <div
              className="flex gap-3 border-b border-border p-5 last:border-0"
              key={name}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
                <AlertTriangle className="size-4" />
              </span>
              <div>
                <strong className="text-xs">{name}</strong>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  {note}
                </p>
                <button
                  className="mt-2 text-[11px] font-bold text-blue-600"
                  type="button"
                >
                  View attendance →
                </button>
              </div>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}

const cardClass = "rounded-xl border border-border bg-card p-5 shadow-card";
const iconButton =
  "grid size-9 place-items-center rounded-lg border border-border text-muted-foreground";
const filterButton =
  "flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold";
function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <article className={`${cardClass} flex items-center gap-4`}>
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <strong className="text-2xl">{value}</strong>
      </div>
    </article>
  );
}
function ShiftCell({ shift }: { shift: string }) {
  if (shift === "off")
    return (
      <div className="grid h-20 place-items-center rounded-xl border border-border bg-muted/60 text-center text-[10px] text-brand-soft">
        <span>
          <Moon className="mx-auto mb-1 size-4" />
          Day off
        </span>
      </div>
    );
  const [start, end, type] = shift.split("|");
  const tone =
    type === "change"
      ? "border-blue-300 bg-blue-100 text-blue-700"
      : type === "issue"
        ? "border-amber-300 bg-amber-100 text-amber-700"
        : "border-emerald-300 bg-emerald-100 text-emerald-700";
  return (
    <div className={`h-20 rounded-xl border p-2 text-[10px] leading-5 ${tone}`}>
      {type === "issue" && <AlertTriangle className="mr-1 inline size-3" />}
      <strong>{start}</strong>
      <span className="block">{end}</span>
      <b>8h 00m</b>
    </div>
  );
}
function Legend({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <i className={`size-3 rounded-full border ${tone}`} />
      {label}
    </span>
  );
}
function Action({
  icon: Icon,
  label,
  danger = false,
}: {
  icon: typeof Pencil;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-full border px-4 py-3 text-left text-xs font-semibold ${danger ? "border-red-200 text-red-500" : "border-border"}`}
      type="button"
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
