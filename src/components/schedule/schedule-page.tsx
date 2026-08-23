"use client";

import {
  AlertTriangle,
  ArrowLeft,
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
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { WeeklyScheduleModal } from "@/components/schedule/weekly-schedule-modal";
import { OneTimeChangeModal } from "@/components/schedule/one-time-change-modal";
import {
  getAdminDriversApi,
  deleteOneTimeChangeApi,
  updateOneTimeChangeApi,
} from "@/lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateHours(start: string, end: string): { hours: number; text: string } {
  try {
    const parseTime = (t: string) => {
      const match = t.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (!match) return 0;
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };
    const startMins = parseTime(start);
    let endMins = parseTime(end);
    if (endMins < startMins) endMins += 24 * 60;
    const diff = endMins - startMins;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return { hours: hrs + mins / 60, text: `${hrs}h ${String(mins).padStart(2, "0")}m` };
  } catch {
    return { hours: 0, text: "-" };
  }
}

function getWorkDaysText(weeklySchedule: any[]) {
  if (!weeklySchedule || weeklySchedule.length === 0) return "Mon – Fri";
  const workingDays = weeklySchedule.filter((item) => item.working).map((item) => item.day);
  if (workingDays.length === 0) return "None";
  if (
    workingDays.length === 5 &&
    ["Mon", "Tue", "Wed", "Thu", "Fri"].every((d) => workingDays.includes(d))
  )
    return "Mon – Fri";
  return workingDays.join(", ");
}

function getScheduleFromShifts(shifts: readonly string[]) {
  if (!shifts) return [];
  const days: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[] = [
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
  ];
  return shifts.map((shift, i) => {
    if (shift === "off") return { day: days[i], working: false };
    const [start, end] = shift.split("|");
    return { day: days[i], working: true, startTime: start, endTime: end };
  });
}

const days = [
  ["Mon", "Jul 14"],
  ["Tue", "Jul 15"],
  ["Wed", "Jul 16"],
  ["Thu", "Jul 17"],
  ["Fri", "Jul 18"],
  ["Sat", "Jul 19"],
  ["Sun", "Jul 20"],
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type OneTimeChange = {
  _id: string;
  driverId: string;         // mongoId of the driver
  driverName: string;
  driverDisplayId: string;
  driverInitials: string;
  driverTone: string;
  date: string;             // ISO
  working: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
};

// ─── Time options (shared) ────────────────────────────────────────────────────

const timeOptions: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = String(m).padStart(2, "0");
    timeOptions.push(`${displayH}:${displayM} ${period}`);
  }
}

// ─── Edit One-Time Change Modal ───────────────────────────────────────────────

function EditOneTimeChangeModal({
  open,
  onClose,
  change,
  onSaveSuccess,
}: {
  open: boolean;
  onClose: () => void;
  change: OneTimeChange | null;
  onSaveSuccess: () => void;
}) {
  const [date, setDate] = useState("");
  const [working, setWorking] = useState(true);
  const [startTime, setStartTime] = useState("9:00 AM");
  const [endTime, setEndTime] = useState("5:00 PM");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (change && open) {
      setDate(change.date ? new Date(change.date).toISOString().split("T")[0] : "");
      setWorking(change.working);
      setStartTime(change.startTime || "9:00 AM");
      setEndTime(change.endTime || "5:00 PM");
      setReason(change.reason || "");
      setErrorText("");
    }
  }, [change, open]);

  if (!open || !change) return null;

  const handleSave = async () => {
    if (!date) { setErrorText("Please select a date."); return; }
    setSaving(true);
    setErrorText("");
    try {
      const token = window.localStorage.getItem("fiki_auth_token") || "";
      const res = await updateOneTimeChangeApi(token, change.driverId, change._id, {
        date,
        working,
        startTime: working ? startTime : undefined,
        endTime: working ? endTime : undefined,
        reason: reason || undefined,
      });
      if (res.success) { onSaveSuccess(); onClose(); }
      else setErrorText(res.error?.message || "Failed to save change.");
    } catch {
      setErrorText("A network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-border bg-card p-6 shadow-2xl sm:p-7 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Edit One-time Schedule Change</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {change.driverName} &bull; {change.driverDisplayId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto py-5 flex-1 space-y-5">
          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-amber-500 font-semibold"
            />
          </div>

          {/* Working toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">Working Status</span>
              <span className="text-[10px] text-muted-foreground block">Toggle off to set as a Day Off</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground">{working ? "Working" : "Day Off"}</span>
              <button
                type="button"
                onClick={() => setWorking(!working)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${working ? "bg-amber-500" : "bg-muted"}`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${working ? "translate-x-5" : "translate-x-0"} flex items-center justify-center`}
                >
                  {working && <span className="size-1.5 rounded-full bg-amber-500" />}
                </span>
              </button>
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Start Time</label>
              <select
                disabled={!working}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-amber-500 disabled:opacity-50 text-center font-semibold"
              >
                {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">End Time</label>
              <select
                disabled={!working}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-amber-500 disabled:opacity-50 text-center font-semibold"
              >
                {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
              </select>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-foreground">Reason for Change</label>
              <span className="text-[10px] text-muted-foreground font-semibold">Optional</span>
            </div>
            <textarea
              placeholder="e.g., Doctor's appointment, family emergency..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-20 rounded-lg border border-border bg-card p-3 text-xs outline-none focus:border-amber-500 font-medium resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-4 mt-2">
          {errorText && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-semibold mb-4">
              <span>{errorText}</span>
            </div>
          )}
          <div className="flex items-center justify-end gap-3.5">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold text-[#52647e] border border-border rounded-xl hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition duration-150"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── One-Time Changes Table ───────────────────────────────────────────────────

function OneTimeChangesTable({
  changes,
  onEdit,
  onDelete,
}: {
  changes: OneTimeChange[];
  onEdit: (c: OneTimeChange) => void;
  onDelete: (c: OneTimeChange) => void;
}) {
  if (changes.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No upcoming one-time schedule changes.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-170 text-left text-xs">
        <thead className="bg-muted/50 text-[10px] uppercase text-muted-foreground">
          <tr>
            <th className="px-5 py-3">Driver</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c) => (
            <tr className="border-t border-border" key={c._id}>
              <td className="px-5 py-4 font-semibold">
                <span
                  className={`mr-2 inline-grid size-7 place-items-center rounded-full text-[9px] text-white ${c.driverTone}`}
                >
                  {c.driverInitials}
                </span>
                {c.driverName}
              </td>
              <td>{new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</td>
              <td>{c.working ? (c.startTime || "—") : <span className="text-muted-foreground">Day off</span>}</td>
              <td>{c.working ? (c.endTime || "—") : "—"}</td>
              <td>
                {c.reason ? (
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] text-blue-600">
                    {c.reason}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td>
                <button
                  className="mr-3 text-blue-600 hover:text-blue-800 transition-colors"
                  type="button"
                  title="Edit"
                  onClick={() => onEdit(c)}
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  className="text-red-500 hover:text-red-700 transition-colors"
                  type="button"
                  title="Delete"
                  onClick={() => onDelete(c)}
                >
                  <Trash2 className="size-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── View All Screen (fullscreen overlay) ─────────────────────────────────────

function ViewAllChangesScreen({
  changes,
  onClose,
  onEdit,
  onDelete,
}: {
  changes: OneTimeChange[];
  onClose: () => void;
  onEdit: (c: OneTimeChange) => void;
  onDelete: (c: OneTimeChange) => void;
}) {
  return (
    <div className="fixed inset-0 z-40 bg-background overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">All One-time Schedule Changes</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {changes.length} total change{changes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <OneTimeChangesTable changes={changes} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

// ─── Main SchedulePage ────────────────────────────────────────────────────────

export function SchedulePage() {
  const [liveDrivers, setLiveDrivers] = useState<any[] | null>(null);
  const [allOneTimeChanges, setAllOneTimeChanges] = useState<OneTimeChange[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [oneTimeModalOpen, setOneTimeModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingChange, setEditingChange] = useState<OneTimeChange | null>(null);
  const [editChangeModalOpen, setEditChangeModalOpen] = useState(false);
  const [viewAllOpen, setViewAllOpen] = useState(false);

  const colors = ["bg-blue-600", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-red-500"];

  const mapDrivers = (rawDrivers: any[]) => {
    const mapped = rawDrivers.map((d: any, idx: number) => {
      const nameParts = (d.name || "Driver").split(" ");
      const initials =
        nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : (d.name || "DR").substring(0, 2).toUpperCase();

      const weeklySchedule = d.profile?.weeklySchedule || [
        { day: "Mon", working: true, startTime: "8:00 AM", endTime: "4:00 PM" },
        { day: "Tue", working: true, startTime: "8:00 AM", endTime: "4:00 PM" },
        { day: "Wed", working: true, startTime: "8:00 AM", endTime: "4:00 PM" },
        { day: "Thu", working: true, startTime: "8:00 AM", endTime: "4:00 PM" },
        { day: "Fri", working: true, startTime: "8:00 AM", endTime: "4:00 PM" },
        { day: "Sat", working: false },
        { day: "Sun", working: false },
      ];

      const shifts = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
        const daySched = weeklySchedule.find((item: any) => item.day === day);
        if (!daySched || !daySched.working) return "off";
        return `${daySched.startTime || "8:00 AM"}|${daySched.endTime || "4:00 PM"}|normal`;
      });

      let totalMins = 0;
      weeklySchedule.forEach((item: any) => {
        if (item.working && item.startTime && item.endTime) {
          const parseTime = (t: string) => {
            const match = t.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
            if (!match) return 0;
            let h = parseInt(match[1], 10);
            const m = parseInt(match[2], 10);
            const ampm = match[3].toUpperCase();
            if (ampm === "PM" && h !== 12) h += 12;
            if (ampm === "AM" && h === 12) h = 0;
            return h * 60 + m;
          };
          const startVal = parseTime(item.startTime);
          let endVal = parseTime(item.endTime);
          if (endVal < startVal) endVal += 24 * 60;
          totalMins += endVal - startVal;
        }
      });
      const totalHrs = Math.floor(totalMins / 60);
      const totalMns = totalMins % 60;
      const totalStr = `${totalHrs}h ${String(totalMns).padStart(2, "0")}m`;

      return {
        initials,
        name: d.name || "Driver",
        id: `DRV-${String(idx + 1).padStart(4, "0")}`,
        mongoId: d.id || d._id,
        tone: colors[idx % colors.length],
        total: totalStr,
        weeklySchedule,
        shifts,
        oneTimeChanges: d.profile?.oneTimeChanges || [],
      };
    });
    return mapped;
  };

  const extractAllChanges = (mappedDrivers: any[]): OneTimeChange[] => {
    const result: OneTimeChange[] = [];
    mappedDrivers.forEach((d) => {
      (d.oneTimeChanges || []).forEach((c: any) => {
        result.push({
          _id: c._id || c.date,
          driverId: d.mongoId,
          driverName: d.name,
          driverDisplayId: d.id,
          driverInitials: d.initials,
          driverTone: d.tone,
          date: c.date,
          working: c.working,
          startTime: c.startTime,
          endTime: c.endTime,
          reason: c.reason,
        });
      });
    });
    // Sort upcoming first
    return result.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const loadDrivers = async () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) return;
    const res = await getAdminDriversApi(token, { approvalStatus: "APPROVED" });
    if (res.success && res.data && Array.isArray(res.data.drivers)) {
      const mapped = mapDrivers(res.data.drivers);
      if (mapped.length > 0) {
        setLiveDrivers(mapped);
        setAllOneTimeChanges(extractAllChanges(mapped));
      }
    }
  };

  useEffect(() => {
    loadDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteChange = async (change: OneTimeChange) => {
    if (!window.confirm(`Delete this one-time change for ${change.driverName} on ${new Date(change.date).toLocaleDateString()}?`)) return;
    const token = window.localStorage.getItem("fiki_auth_token") || "";
    const res = await deleteOneTimeChangeApi(token, change.driverId, change._id);
    if (res.success) {
      await loadDrivers();
    } else {
      alert(res.error?.message || "Failed to delete change.");
    }
  };

  const handleEditChange = (change: OneTimeChange) => {
    setEditingChange(change);
    setEditChangeModalOpen(true);
  };

  const activeDriverList = liveDrivers || [];
  const selected = activeDriverList.find((d) => d.id === selectedId) || activeDriverList[0] || null;
  const selectedSchedule = selected
    ? (selected as any).weeklySchedule || getScheduleFromShifts((selected as any).shifts)
    : [];

  // Show latest 5 one-time changes on the schedule page
  const previewChanges = allOneTimeChanges.slice(0, 5);

  return (
    <>
      {viewAllOpen && (
        <ViewAllChangesScreen
          changes={allOneTimeChanges}
          onClose={() => setViewAllOpen(false)}
          onEdit={(c) => {
            handleEditChange(c);
          }}
          onDelete={async (c) => {
            await handleDeleteChange(c);
          }}
        />
      )}

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
                  <span className="text-xs font-semibold">Jul 14 – Jul 20, 2026</span>
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
                      <small className="mt-1 block font-normal normal-case text-brand-soft">{date}</small>
                    </span>
                  ))}
                  <span>Total</span>
                </div>
                {activeDriverList.length === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">Loading schedules...</div>
                )}
                {activeDriverList.map((driver) => (
                  <div
                    className={`grid grid-cols-[180px_repeat(7,1fr)_90px] items-center gap-2 border-b border-border px-5 py-3 last:border-0 ${selected?.id === driver.id ? "bg-blue-50/30" : ""}`}
                    key={driver.id}
                  >
                    <button
                      className="flex items-center gap-3 text-left"
                      onClick={() => setSelectedId(driver.id)}
                      type="button"
                    >
                      <span className={`grid size-8 place-items-center rounded-full text-[10px] font-bold text-white ${driver.tone}`}>
                        {driver.initials}
                      </span>
                      <span>
                        <strong className="block text-xs">{driver.name}</strong>
                        <small className="text-[10px] text-muted-foreground">{driver.id}</small>
                      </span>
                    </button>
                    {driver.shifts.map((shift: string, index: number) => (
                      <ShiftCell key={days[index][0]} shift={shift} />
                    ))}
                    <strong className="text-center text-xs">{driver.total}</strong>
                  </div>
                ))}
                <div className="flex flex-wrap gap-5 px-6 py-4 text-[10px] text-muted-foreground">
                  <Legend tone="bg-emerald-100 border-emerald-300" label="Scheduled" />
                  <Legend tone="bg-blue-100 border-blue-300" label="One-time change" />
                  <Legend tone="bg-slate-100 border-slate-200" label="Day off" />
                  <Legend tone="bg-amber-100 border-amber-300" label="Schedule issue" />
                </div>
              </div>
            </div>
          </article>

          <aside className="space-y-5">
            <article className={cardClass}>
              <div className="relative">
                <select
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  value={selected?.id || ""}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {activeDriverList.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                  ))}
                </select>
                {selected ? (
                  <div className="flex items-center gap-3 rounded-xl border border-border p-3 bg-card relative z-0">
                    <span className={`grid size-9 place-items-center rounded-full text-xs font-bold text-white ${selected.tone}`}>
                      {selected.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-xs">{selected.name}</strong>
                      <span className="text-[10px] text-muted-foreground">{selected.id}</span>
                    </div>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-border p-3 bg-card relative z-0 text-muted-foreground">
                    Select a driver...
                    <ChevronDown className="size-4 ml-auto" />
                  </div>
                )}
              </div>
              <div className="mt-5 flex justify-between">
                <h3 className="text-sm font-bold">Current schedule</h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">● Active</span>
              </div>
              <div className="mt-3 divide-y divide-border">
                {[
                  ["Work days", getWorkDaysText(selectedSchedule)],
                  ["Start time", selectedSchedule.find((item: any) => item.working)?.startTime || "8:00 AM"],
                  ["End time", selectedSchedule.find((item: any) => item.working)?.endTime || "4:00 PM"],
                  [
                    "Daily hours",
                    selectedSchedule.find((item: any) => item.working)
                      ? calculateHours(
                          selectedSchedule.find((item: any) => item.working).startTime,
                          selectedSchedule.find((item: any) => item.working).endTime
                        ).text
                      : "-",
                  ],
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
                <Action icon={Pencil} label="Edit schedule" onClick={() => setEditModalOpen(true)} />
                <Action icon={Plus} label="Add one-time change" onClick={() => setOneTimeModalOpen(true)} />
                <Action icon={Moon} label="Add day off" />
                <Action danger icon={Trash2} label="Remove schedule" />
              </div>
            </article>
          </aside>
        </section>

        <WeeklyScheduleModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          driverId={selected ? (selected as any).mongoId || selected.id : ""}
          driverName={selected ? selected.name : ""}
          driverDisplayId={selected ? selected.id : ""}
          initialSchedule={selected ? (selected as any).weeklySchedule || [] : []}
          onSaveSuccess={loadDrivers}
        />

        <OneTimeChangeModal
          open={oneTimeModalOpen}
          onClose={() => setOneTimeModalOpen(false)}
          driverId={selected ? (selected as any).mongoId || selected.id : ""}
          driverName={selected ? selected.name : ""}
          driverDisplayId={selected ? selected.id : ""}
          onSaveSuccess={loadDrivers}
        />

        <EditOneTimeChangeModal
          open={editChangeModalOpen}
          onClose={() => { setEditChangeModalOpen(false); setEditingChange(null); }}
          change={editingChange}
          onSaveSuccess={() => { setEditChangeModalOpen(false); setEditingChange(null); loadDrivers(); }}
        />

        {/* ── Upcoming one-time changes + Schedule issues ── */}
        <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="flex items-start justify-between p-5">
              <div>
                <h2 className="text-base font-bold">Upcoming one-time changes</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">Scheduled changes for this week</p>
              </div>
              <button
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                type="button"
                onClick={() => setViewAllOpen(true)}
              >
                View all →
              </button>
            </div>
            <OneTimeChangesTable
              changes={previewChanges}
              onEdit={handleEditChange}
              onDelete={handleDeleteChange}
            />
          </article>

          <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="text-base font-bold">Schedule issues</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">Requires your attention</p>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">2 active</span>
            </div>
            {[
              ["Carlos Mendez", "Shift overlap detected on Wednesday — conflicts with vehicle maintenance window."],
              ["Sarah Williams", "Missing attendance confirmation for Thursday's scheduled shift."],
            ].map(([name, note]) => (
              <div className="flex gap-3 border-b border-border p-5 last:border-0" key={name}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
                  <AlertTriangle className="size-4" />
                </span>
                <div>
                  <strong className="text-xs">{name}</strong>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{note}</p>
                  <button className="mt-2 text-[11px] font-bold text-blue-600" type="button">
                    View attendance →
                  </button>
                </div>
              </div>
            ))}
          </article>
        </section>
      </div>
    </>
  );
}

// ─── Utility components ───────────────────────────────────────────────────────

const cardClass = "rounded-xl border border-border bg-card p-5 shadow-card";
const iconButton = "grid size-9 place-items-center rounded-lg border border-border text-muted-foreground";
const filterButton = "flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold";

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
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>
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
  onClick,
}: {
  icon: typeof Pencil;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-full border px-4 py-3 text-left text-xs font-semibold ${danger ? "border-red-200 text-red-500" : "border-border"}`}
      type="button"
      onClick={onClick}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
