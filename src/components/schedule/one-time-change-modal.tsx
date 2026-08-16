"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { addOneTimeChangeApi } from "@/lib/api";

interface OneTimeChangeModalProps {
  open: boolean;
  onClose: () => void;
  driverId: string; // Mongo ID
  driverName: string;
  driverDisplayId: string; // e.g. DRV-0004
  onSaveSuccess?: () => void;
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

export function OneTimeChangeModal({
  open,
  onClose,
  driverId,
  driverName,
  driverDisplayId,
  onSaveSuccess,
}: OneTimeChangeModalProps) {
  const [date, setDate] = useState("");
  const [working, setWorking] = useState(true);
  const [startTime, setStartTime] = useState("9:00 AM");
  const [endTime, setEndTime] = useState("5:00 PM");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  if (!open) return null;

  const handleSave = async () => {
    if (!date) {
      setErrorText("Please select a date.");
      return;
    }

    setSaving(true);
    setErrorText("");
    try {
      const token = window.localStorage.getItem("fiki_auth_token") || "";
      const payload = {
        date,
        working,
        startTime: working ? startTime : undefined,
        endTime: working ? endTime : undefined,
        reason: reason || undefined,
      };

      const res = await addOneTimeChangeApi(token, driverId, payload);
      if (res.success) {
        onSaveSuccess?.();
        onClose();
      } else {
        setErrorText(res.error?.message || "Failed to save schedule change.");
      }
    } catch {
      setErrorText("A network error occurred while saving change.");
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
            <h2 className="text-lg font-extrabold text-foreground">Set One-time Schedule Change</h2>
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

        {/* Form Body */}
        <div className="overflow-y-auto py-5 flex-1 space-y-5">
          {/* Select Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-amber-500 font-semibold"
            />
          </div>

          {/* Working Status Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">Working Status</span>
              <span className="text-[10px] text-muted-foreground block">Toggle off to set as a Day Off</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground">
                {working ? "Working" : "Day Off"}
              </span>
              <button
                type="button"
                onClick={() => setWorking(!working)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  working ? "bg-amber-500" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    working ? "translate-x-5" : "translate-x-0"
                  } flex items-center justify-center`}
                >
                  {working && <span className="size-1.5 rounded-full bg-amber-500" />}
                </span>
              </button>
            </div>
          </div>

          {/* Times Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Start Time</label>
              <select
                disabled={!working}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-border bg-card px-3 text-xs outline-none focus:border-amber-500 disabled:opacity-50 text-center font-semibold"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
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
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
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
              {saving ? "Saving..." : "Save Change"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
