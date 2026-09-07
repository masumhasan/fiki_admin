"use client";

import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { getDispatchNumberApi, updateDispatchNumberApi, getCrmContentApi, updateCrmContentApi } from "@/lib/api";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

type CrmSection = "privacyPolicy" | "termsOfService" | "helpCenter";

export default function CrmPage() {
  const [dispatchNumber, setDispatchNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingDispatch, setSavingDispatch] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [activeSection, setActiveSection] = useState<CrmSection>("privacyPolicy");
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
    setCrmContent((prev) => ({
      ...prev,
      [activeSection]: value,
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
    <div className="space-y-6">
      <PageHeader
        title="CRM & Dispatch Management"
        description="Manage the global dispatch number and application legal/help contents."
      />
      
      {/* Dispatch Number Panel */}
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
              onClick={handleSaveDispatch}
              disabled={savingDispatch || !dispatchNumber.trim()}
              className="rounded-full bg-[#f9b310] px-6 py-2.5 text-sm font-bold text-[#0b2b58] transition-colors hover:bg-[#e6a50c] disabled:opacity-50"
            >
              {savingDispatch ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Content Management Panel */}
      <div className="rounded-[18px] border border-[#e1e5ea] bg-white p-6 shadow-[0_9px_24px_rgba(15,35,65,0.07)]">
        <h2 className="text-lg font-bold text-[#172033] mb-4">Manage Content</h2>
        <p className="text-xs text-[#69758a] mb-4">
          Select a page to edit. General, passengers, and drivers policies are now managed within a single unified page editor.
        </p>
        
        {/* Sections Tabs */}
        <div className="flex space-x-1 border-b border-slate-200 mb-6">
          {[
            { id: "privacyPolicy", label: "Privacy Policy" },
            { id: "termsOfService", label: "Terms of Service" },
            { id: "helpCenter", label: "Help Center" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as CrmSection)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeSection === tab.id
                  ? "border-[#173d76] text-[#173d76]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Unified Editor with Text Color Picker */}
        <div className="mb-4 bg-white">
          <ReactQuill 
            theme="snow" 
            modules={quillModules}
            value={crmContent[activeSection] || ""} 
            onChange={handleCrmChange} 
            className="h-[350px] mb-12"
          />
        </div>

        {crmMessage.text && (
          <div className={`mb-4 rounded-xl p-3 text-sm ${crmMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {crmMessage.text}
          </div>
        )}

        <button
          onClick={handleSaveCrm}
          disabled={savingCrm}
          className="rounded-full bg-[#173d76] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#122b54] disabled:opacity-50"
        >
          {savingCrm ? "Saving..." : "Save Content"}
        </button>
      </div>

    </div>
  );
}
