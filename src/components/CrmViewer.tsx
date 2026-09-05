"use client";

import { useEffect, useState } from "react";
import { getCrmContentApi } from "@/lib/api";

type CrmSection = "privacyPolicy" | "termsOfService" | "helpCenter";
type CrmSubTab = "passengers" | "drivers" | "general";

interface CrmViewerProps {
  section: CrmSection;
  title: string;
}

export function CrmViewer({ section, title }: CrmViewerProps) {
  const [activeTab, setActiveTab] = useState<CrmSubTab>("general");
  const [content, setContent] = useState<Record<CrmSubTab, string>>({
    passengers: "",
    drivers: "",
    general: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCrmContentApi().then((res) => {
      if (res.success && res.data) {
        setContent(res.data[section] || { passengers: "", drivers: "", general: "" });
      }
      setLoading(false);
    });
  }, [section]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:py-20">
      <h1 className="mb-8 text-3xl font-bold text-[#0b2b58] md:text-4xl">{title}</h1>
      
      {/* Tabs */}
      <div className="mb-8 flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {["general", "passengers", "drivers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as CrmSubTab)}
            className={"whitespace-nowrap px-4 py-2 text-sm font-semibold transition-colors capitalize " + (activeTab === tab ? "border-b-2 border-[#f9b310] text-[#0b2b58]" : "text-slate-500 hover:text-slate-800")}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-[#e1e5ea] bg-white p-6 md:p-8 shadow-sm min-h-[400px] w-full overflow-hidden">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        ) : (
          <div 
            className="prose prose-slate max-w-none prose-headings:text-[#0b2b58] prose-a:text-[#173d76] prose-p:break-words prose-p:whitespace-pre-wrap break-words w-full overflow-hidden"
            dangerouslySetInnerHTML={{ __html: content[activeTab] || "<p>No content available for this section.</p>" }}
          />
        )}
      </div>
    </div>
  );
}
