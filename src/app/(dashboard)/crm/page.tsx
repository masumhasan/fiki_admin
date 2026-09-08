"use client";

import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { getDispatchNumberApi, updateDispatchNumberApi, getCrmContentApi, updateCrmContentApi } from "@/lib/api";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

type CrmSection = "privacyPolicy" | "termsOfService" | "helpCenter";
type CrmTab = CrmSection | "dispatchNumber";

export default function CrmPage() {
  const [dispatchNumber, setDispatchNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingDispatch, setSavingDispatch] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [activeTab, setActiveTab] = useState<CrmTab>("privacyPolicy");
  const [crmContent, setCrmContent] = useState<Record<CrmSection, string>>({
    privacyPolicy: "",
    termsOfService: "",
    helpCenter: "",
  });
  const [savingCrm, setSavingCrm] = useState(false);
  const [crmMessage, setCrmMessage] = useState({ type: "", text: "" });

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }], // Text color & background color picker
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "clean"],
      ],
    }),
    []
  );

  const normalizeSection = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      const parts = [val.general, val.passengers, val.drivers].filter(
        (p) => p && typeof p === "string" && p.trim() !== ""
      );
      if (parts.length === 0) return "";
      return Array.from(new Set(parts)).join("<br/><br/>");
    }
    return "";
  };

  useEffect(() => {
    const token = window.localStorage.getItem("fiki_auth_token");
    if (token) {
      Promise.all([
        getDispatchNumberApi(token),
        getCrmContentApi()
      ]).then(([dispatchRes, crmRes]) => {
        if (dispatchRes.success && dispatchRes.data) {
          setDispatchNumber(dispatchRes.data.dispatchNumber);
        }
        if (crmRes.success && crmRes.data) {
          setCrmContent({
            privacyPolicy: normalizeSection(crmRes.data.privacyPolicy),
            termsOfService: normalizeSection(crmRes.data.termsOfService),
            helpCenter: normalizeSection(crmRes.data.helpCenter),
          });
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleSaveDispatch = async () => {
    setMessage({ type: "", text: "" });
    setSavingDispatch(true);
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
    setSavingDispatch(false);
  };

  const handleCrmChange = (value: string) => {
    if (activeTab === "dispatchNumber") return;
    setCrmContent((prev) => ({
      ...prev,
      [activeTab]: value,
    }));
  };

  const handleSaveCrm = async () => {
    setCrmMessage({ type: "", text: "" });
    setSavingCrm(true);
    const token = window.localStorage.getItem("fiki_auth_token");
    if (token) {
      const res = await updateCrmContentApi(token, crmContent);
      if (res.success && res.data) {
        setCrmContent({
          privacyPolicy: normalizeSection(res.data.privacyPolicy),
          termsOfService: normalizeSection(res.data.termsOfService),
          helpCenter: normalizeSection(res.data.helpCenter),
        });
        setCrmMessage({ type: "success", text: "Content saved successfully!" });
      } else {
        setCrmMessage({ type: "error", text: res.error?.message || "Failed to save content." });
      }
    }
    setSavingCrm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader
          title="CRM & Dispatch Management"
          description="Manage the global dispatch number and application legal/help contents."
        />
        {activeTab !== "dispatchNumber" && (
          <button
            onClick={handleSaveCrm}
            disabled={savingCrm}
            className="self-start sm:self-auto rounded-full bg-[#173d76] px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#122b54] disabled:opacity-50 shadow-sm whitespace-nowrap"
          >
            {savingCrm ? "Saving..." : "Save Content"}
          </button>
        )}
      </div>

      {/* Content & Dispatch Management Panel */}
      <div className="rounded-[18px] border border-[#e1e5ea] bg-white p-5 sm:p-6 shadow-[0_9px_24px_rgba(15,35,65,0.07)]">
        <h2 className="text-lg font-bold text-[#172033] mb-2">Manage Content</h2>
        <p className="text-xs text-[#69758a] mb-5">
          Select a tab to edit content or manage dispatch settings. General, passengers, and drivers policies are now managed within a single unified page editor.
        </p>
        
        {/* Sections Tabs */}
        <div className="flex space-x-1 border-b border-slate-200 mb-6 overflow-x-auto">
          {[
            { id: "privacyPolicy", label: "Privacy Policy" },
            { id: "termsOfService", label: "Terms of Service" },
            { id: "helpCenter", label: "Help Center" },
            { id: "dispatchNumber", label: "Manage Dispatch Number" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CrmTab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#173d76] text-[#173d76]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "dispatchNumber" ? (
          /* Manage Dispatch Number Tab Content */
          <div className="max-w-2xl py-2">
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
                  onClick={handleSaveDispatch}
                  disabled={savingDispatch || !dispatchNumber.trim()}
                  className="rounded-full bg-[#f9b310] px-6 py-2.5 text-sm font-bold text-[#0b2b58] transition-colors hover:bg-[#e6a50c] disabled:opacity-50"
                >
                  {savingDispatch ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Legal/Help Content Tab Content */
          <div className="space-y-4">
            <div className="crm-quill-editor bg-white">
              <ReactQuill 
                theme="snow" 
                modules={quillModules}
                value={crmContent[activeTab] || ""} 
                onChange={handleCrmChange} 
                className="w-full"
              />
            </div>

            {crmMessage.text && (
              <div className={`rounded-xl p-3 text-sm ${crmMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {crmMessage.text}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSaveCrm}
                disabled={savingCrm}
                className="rounded-full bg-[#173d76] px-8 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#122b54] disabled:opacity-50 shadow-sm"
              >
                {savingCrm ? "Saving..." : "Save Content"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
