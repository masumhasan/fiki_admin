"use client";

import { X, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { updateDriverScheduleApi } from "@/lib/api";

interface WeeklyScheduleModalProps {
  open: boolean;
  onClose: () => void;
  driverId: string; // Mongo ID
  driverName: string;
  driverDisplayId: string; // e.g. DRV-0004
  initialSchedule?: any[];
  onSaveSuccess?: () => void;
}

interface DayState {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  working: boolean;
  startTime: string;
  endTime: string;
}

const timeOptions: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = String(m).padStart(2, "0");
    timeOptions.push(`${displayH}:${displayM} ${period}`);
  }
}

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
    if (endMins < startMins) {
      endMins += 24 * 60; // Next day
    }
    const diff = endMins - startMins;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return {
      hours: hrs + mins / 60,
      text: `${hrs}h ${String(mins).padStart(2, "0")}m`,
    };
  } catch {
    return { hours: 0, text: "-" };
  }
}

export function WeeklyScheduleModal({
  open,
  onClose,
  driverId,
  driverName,
  driverDisplayId,
  initialSchedule,
  onSaveSuccess,
}: WeeklyScheduleModalProps) {
  const [schedule, setSchedule] = useState<DayState[]>([
    { day: "Mon", working: true, startTime: "8:00 AM", endTime: "4:00 PM" },
    { day: "Tue", working: true, startTime: "8:00 AM", endTime: "4:00 PM" },
    { day: "Wed", working: true, startTime: "9:00 AM", endTime: "5:00 PM" },
    { day: "Thu", working: true, startTime: "8:00 AM", endTime: "4:00 PM" },
    { day: "Fri", working: true, startTime: "8:00 AM", endTime: "4:00 PM" },
    { day: "Sat", working: false, startTime: "8:00 AM", endTime: "4:00 PM" },
    { day: "Sun", working: false, startTime: "8:00 AM", endTime: "4:00 PM" },
  ]);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (initialSchedule && Array.isArray(initialSchedule) && initialSchedule.length > 0) {
      const mapped = initialSchedule.map((item: any) => ({
        day: item.day,
        working: item.working,
        startTime: item.startTime || "8:00 AM",
        endTime: item.endTime || "4:00 PM",
      }));
      setSchedule(mapped);
    }
  }, [initialSchedule, open]);

  if (!open) return null;

  const handleToggle = (index: number) => {
    const updated = [...schedule];
    updated[index].working = !updated[index].working;
    setSchedule(updated);
    setErrorText("");
  };

  const handleTimeChange = (index: number, field: "startTime" | "endTime", value: string) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
    setErrorText("");
  };

  // Calculate info per day and check if any exceeds 8 hours
  const scheduleInfo = schedule.map((item) => {
    if (!item.working) return { ...item, totalHours: 0, timeText: "-", exceedsLimit: false };
    const { hours, text } = calculateHours(item.startTime, item.endTime);
    return { ...item, totalHours: hours, timeText: text, exceedsLimit: hours > 8 };
  });

  const anyExceeds = scheduleInfo.some((item) => item.exceedsLimit);
  const totalWeeklyHours = scheduleInfo.reduce((sum, item) => sum + (item.totalHours || 0), 0);

  const handleSave = async () => {
    if (anyExceeds) {
      setErrorText("Cannot save schedule. Daily working time cannot exceed 8 hours.");
      return;
    }

    setSaving(true);
    setErrorText("");
    try {
      const token = window.localStorage.getItem("fiki_auth_token") || "";
      const cleanedSchedule = schedule.map((item) => ({
        day: item.day,
        working: item.working,
        startTime: item.working ? item.startTime : undefined,
        endTime: item.working ? item.endTime : undefined,
      }));

      const res = await updateDriverScheduleApi(token, driverId, cleanedSchedule);
      if (res.success) {
        onSaveSuccess?.();
        onClose();
      } else {
        setErrorText(res.error?.message || "Failed to save schedule.");
      }
    } catch {
      setErrorText("A network error occurred while saving schedule.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[28px] border border-border bg-card p-6 shadow-2xl sm:p-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Set Weekly Schedule</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {driverName} &bull; {driverDisplayId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Schedule grid body */}
        <div className="overflow-y-auto py-4 flex-1 pr-1">
          <div className="grid grid-cols-[80px_160px_1fr_1fr_100px] gap-4 items-center text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2.5 mb-4">
            <span className="text-left pl-2">Day</span>
            <span className="text-left">Schedule</span>
            <span>Start Time</span>
            <span>End Time</span>
            <span>Total Hours</span>
          </div>

          <div className="space-y-4">
            {scheduleInfo.map((item, index) => (
              <div
                key={item.day}
                className="grid grid-cols-[80px_160px_1fr_1fr_100px] gap-4 items-center text-center text-sm font-semibold text-foreground py-1.5 border-b border-border/40 last:border-0"
              >
                {/* Day name */}
                <span className="text-left pl-2 font-bold">{item.day}</span>

                {/* Switch for Working status */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(index)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      item.working ? "bg-amber-500" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        item.working ? "translate-x-5" : "translate-x-0"
                      } flex items-center justify-center`}
                    >
                      {item.working && <span className="size-1.5 rounded-full bg-amber-500" />}
                    </span>
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {item.working ? "Working" : "Day Off"}
                  </span>
                </div>

                {/* Start Time dropdown */}
                <div>
                  <select
                    disabled={!item.working}
                    value={item.startTime}
                    onChange={(e) => handleTimeChange(index, "startTime", e.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-amber-500 disabled:opacity-50 text-center font-medium"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* End Time dropdown */}
                <div>
                  <select
                    disabled={!item.working}
                    value={item.endTime}
                    onChange={(e) => handleTimeChange(index, "endTime", e.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-amber-500 disabled:opacity-50 text-center font-medium"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Total hours */}
                <div
                  className={`text-xs font-bold ${
                    item.exceedsLimit ? "text-rose-600" : "text-muted-foreground"
                  }`}
                >
                  {item.timeText}
                  {item.exceedsLimit && (
                    <span className="block text-[9px] font-bold text-rose-500 mt-0.5">
                      &gt; 8 hours Limit
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning notification & Footer */}
        <div className="border-t border-border pt-4 mt-2">
          {anyExceeds && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 text-xs text-rose-600 font-semibold mb-4">
              <AlertTriangle className="size-4 shrink-0" />
              <span>Warning: Working hours for some days exceed the 8 hours limit. Adjust the times before saving.</span>
            </div>
          )}
          {errorText && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-semibold mb-4">
              <span>{errorText}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-2">
              <span className="text-xs font-bold text-[#52647e]">Total Weekly Hours:</span>
              <span className="text-sm font-extrabold text-amber-600">{totalWeeklyHours.toFixed(1)}h</span>
            </div>
            <div className="flex items-center justify-end gap-3.5 w-full sm:w-auto">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-5 py-2.5 text-xs font-bold text-[#52647e] border border-border rounded-xl hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || anyExceeds}
                className="px-5 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition duration-150"
              >
                {saving ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
