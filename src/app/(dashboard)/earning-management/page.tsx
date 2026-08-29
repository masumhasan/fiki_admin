"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  RefreshCw,
  Search,
  TrendingUp,
  UserCheck,
  X,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const API_BASE = API_BASE_URL;

interface DriverEarningItem {
  driverId: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  hourlyRate: number;
  approvedHours: number;
  tripBonusRate: number;
  completedTrips: number;
  tripBonus: number;
  regularWages: number;
  grossEarnings: number;
  payrollStatus: string;
}

interface EarningSummary {
  totalPayroll: number;
  avgHourlyRate: number;
  totalApprovedHours: number;
  totalDriversCount: number;
}

export default function EarningManagementPage() {
  const [data, setData] = useState<{
    payPeriodRange: string;
    summary: EarningSummary;
    drivers: DriverEarningItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<DriverEarningItem | null>(null);
  const [editRate, setEditRate] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editBonusRate, setEditBonusRate] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchEarningsData = async () => {
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch {
      // error fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const handleOpenEditModal = (driver: DriverEarningItem) => {
    setSelectedDriver(driver);
    setEditRate(String(driver.hourlyRate));
    setEditHours(String(driver.approvedHours));
    setEditBonusRate(String(driver.tripBonusRate ?? 3));
  };

  const handleSaveEarnings = async () => {
    if (!selectedDriver) return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) return;

    const rateNum = parseFloat(editRate);
    const hoursNum = parseFloat(editHours);
    const bonusRateNum = parseFloat(editBonusRate);

    if (isNaN(rateNum) || rateNum < 0 || isNaN(hoursNum) || hoursNum < 0 || isNaN(bonusRateNum) || bonusRateNum < 0) {
      alert("Please enter valid numeric values for Hourly Rate, Approved Hours, and Trip Bonus Rate.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/admin/earnings/${selectedDriver.driverId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hourlyRate: rateNum,
          approvedHours: hoursNum,
          tripBonusRate: bonusRateNum,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setToastMessage(`Updated earnings parameters for ${selectedDriver.name}`);
        setSelectedDriver(null);
        fetchEarningsData();
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        alert(json.error?.message || "Failed to update driver earnings");
      }
    } catch {
      alert("Network error updating driver earnings");
    } finally {
      setSaving(false);
    }
  };

  const filteredDrivers = (data?.drivers || []).filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500 p-4 text-sm font-semibold text-white shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="size-5" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
            Earning Management
          </h1>
          <p className="mt-1 text-xs text-[#8b95a7]">
            Set hourly rates and approved pay period hours to calculate driver earnings automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchEarningsData}
            className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-2 text-xs font-bold text-[#475569] shadow-sm hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-2 text-xs font-bold text-[#1e293b] shadow-sm">
            <Calendar className="size-4 text-[#64748b]" />
            <span>{data?.payPeriodRange || "Current 14-Day Pay Period"}</span>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-[0_4px_20px_rgba(8,37,82,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748b]">Total Estimated Payroll</span>
            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Banknote className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[#0f172a]">
            ${(data?.summary?.totalPayroll || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-[#94a3b8]">Across {data?.summary?.totalDriversCount || 0} active drivers</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-[0_4px_20px_rgba(8,37,82,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748b]">Avg Hourly Rate</span>
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[#0f172a]">
            ${(data?.summary?.avgHourlyRate || 14).toFixed(2)}/hr
          </p>
          <p className="mt-1 text-[11px] text-[#94a3b8]">Standard fleet base rate</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-[0_4px_20px_rgba(8,37,82,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748b]">Total Approved Hours</span>
            <span className="grid size-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <Clock className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[#0f172a]">
            {data?.summary?.totalApprovedHours || 0} hrs
          </p>
          <p className="mt-1 text-[11px] text-[#94a3b8]">14-day pay period allocation</p>
        </div>
      </div>

      {/* Main Content Table Container */}
      <div className="rounded-2xl border border-border/80 bg-white shadow-[0_6px_24px_rgba(8,37,82,0.04)] overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-border/80 p-5 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search driver by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border pl-9 pr-4 py-2 text-xs font-medium focus:border-brand-blue focus:outline-none"
            />
          </div>
          <div className="text-xs text-muted-foreground font-semibold">
            Formula: <span className="text-foreground">(Hourly Rate × Approved Hours) + (Trips × Trip Bonus Rate)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/80 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Driver</th>
                <th className="px-5 py-3.5">Hourly Rate</th>
                <th className="px-5 py-3.5">Approved Hours</th>
                <th className="px-5 py-3.5">Completed Trips</th>
                <th className="px-5 py-3.5">Trip Bonus</th>
                <th className="px-5 py-3.5">Regular Wages</th>
                <th className="px-5 py-3.5">Total Gross Salary</th>
                <th className="px-5.3 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                [...Array(4)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 w-32 rounded bg-slate-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-12 rounded bg-slate-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-16 rounded bg-slate-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-slate-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-7 w-20 rounded-xl bg-slate-200 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                    No drivers found.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.driverId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-blue-100 font-bold text-blue-700">
                          {driver.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{driver.name}</p>
                          <p className="text-[11px] text-slate-500">{driver.email || driver.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      ${driver.hourlyRate.toFixed(2)}/hr
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {driver.approvedHours} hrs
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                        {driver.completedTrips} trips
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-600">
                      ${(driver.completedTrips * (driver.tripBonusRate ?? 3)).toFixed(2)}
                      <span className="block text-[10px] font-normal text-muted-foreground">
                        {driver.completedTrips} × ${(driver.tripBonusRate ?? 3).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      ${driver.regularWages.toFixed(2)}
                      <span className="block text-[10px] font-normal text-muted-foreground">
                        {driver.approvedHours}h × ${driver.hourlyRate}/h
                      </span>
                    </td>
                    <td className="px-5 py-4 text-base font-extrabold text-blue-700">
                      ${driver.grossEarnings.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(driver)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="size-3.5" />
                        Edit Earnings
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Driver Earnings Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-border">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Set Earnings Parameters
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDriver.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Hourly Rate ($ / hr)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  placeholder="e.g. 14.00"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Approved Pay Period Hours
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  placeholder="e.g. 80"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Trip Bonus Rate ($ / trip)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={editBonusRate}
                  onChange={(e) => setEditBonusRate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  placeholder="e.g. 3.00"
                />
              </div>

              {/* Calculated Preview Box */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 space-y-2 text-xs">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Regular Wages:</span>
                  <span className="font-bold text-slate-900">
                    ${((parseFloat(editRate) || 0) * (parseFloat(editHours) || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Trip Bonus ({selectedDriver.completedTrips} trips × ${(parseFloat(editBonusRate) || 0).toFixed(2)}):</span>
                  <span className="font-bold text-slate-900">
                    ${(selectedDriver.completedTrips * (parseFloat(editBonusRate) || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200/80 pt-2 text-sm font-extrabold text-blue-700">
                  <span>New Gross Salary:</span>
                  <span>
                    ${(((parseFloat(editRate) || 0) * (parseFloat(editHours) || 0)) + (selectedDriver.completedTrips * (parseFloat(editBonusRate) || 0))).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEarnings}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Earnings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
