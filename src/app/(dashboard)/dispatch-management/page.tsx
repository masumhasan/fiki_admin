"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { getDispatchNumberApi, updateDispatchNumberApi } from "@/lib/api";

export default function DispatchManagementPage() {
  const [dispatchNumber, setDispatchNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const token = window.localStorage.getItem("fiki_auth_token");
    if (token) {
      getDispatchNumberApi(token).then((res) => {
        if (res.success && res.data) {
          setDispatchNumber(res.data.dispatchNumber);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    setMessage({ type: "", text: "" });
    setSaving(true);
    const token = window.localStorage.getItem("fiki_auth_token");
    if (token) {
      const res = await updateDispatchNumberApi(token, dispatchNumber);
      if (res.success && res.data) {
        setDispatchNumber(res.data.dispatchNumber);
        setMessage({ type: "success", text: "Dispatch number updated successfully!" });
      } else {
        setMessage({ type: "error", text: res.error?.message || "Failed to update." });
      }
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Dispatch Management", href: "/dispatch-management" },
        ]}
      />
      <div className="rounded-[18px] border border-[#e1e5ea] bg-white p-6 shadow-[0_9px_24px_rgba(15,35,65,0.07)] max-w-2xl">
        <h2 className="text-lg font-bold text-[#172033] mb-4">Manage Dispatch Number</h2>
        <p className="text-sm text-[#69758a] mb-6">
          This number will be displayed on the driver and passenger portals for emergency contact and general dispatch.
        </p>

        {loading ? (
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="dispatchNumber" className="mb-1.5 block text-xs font-semibold text-[#172033]">
                Dispatch Phone Number
              </label>
              <input
                id="dispatchNumber"
                type="text"
                className="w-full rounded-xl border border-[#e1e5ea] bg-white px-4 py-3 text-sm text-[#172033] placeholder:text-[#9aa3b2] focus:border-[#0b2b58] focus:outline-none focus:ring-1 focus:ring-[#0b2b58]"
                placeholder="e.g. +1 800 345 4825"
                value={dispatchNumber}
                onChange={(e) => setDispatchNumber(e.target.value)}
              />
            </div>
            
            {message.text && (
              <div className={`rounded-xl p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !dispatchNumber.trim()}
              className="rounded-full bg-[#f9b310] px-6 py-2.5 text-sm font-bold text-[#0b2b58] transition-colors hover:bg-[#e6a50c] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
