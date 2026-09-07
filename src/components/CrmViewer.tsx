"use client";

import { useEffect, useState } from "react";
import { getCrmContentApi } from "@/lib/api";
import { BrandMark } from "@/components/brand-mark";
import Link from "next/link";

type CrmSection = "privacyPolicy" | "termsOfService" | "helpCenter";

interface CrmViewerProps {
  section: CrmSection;
  title: string;
}

export function CrmViewer({ section, title }: CrmViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

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
    getCrmContentApi().then((res) => {
      if (res.success && res.data) {
        setContent(normalizeSection(res.data[section]));
      }
      setLoading(false);
    });
  }, [section]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:py-20">
      {/* Brand Logo Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <BrandMark className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold tracking-tight text-[#0b2b58]">FIKI TRANSIT</span>
        </Link>
      </div>

      <h1 className="mb-8 text-3xl font-bold text-[#0b2b58] md:text-4xl">{title}</h1>

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
            dangerouslySetInnerHTML={{ __html: content || "<p>No content available for this section.</p>" }}
          />
        )}
      </div>
    </div>
  );
}
