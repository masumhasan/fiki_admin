"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCrmContentApi } from "@/lib/api";

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

  const subtitle =
    section === "privacyPolicy"
      ? "PRIVACY POLICY"
      : section === "termsOfService"
      ? "TERMS OF SERVICE"
      : "HELP CENTER";

  return (
    <div className="min-h-screen bg-[#f4f7fb] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Centered Brand Header matching sample UI */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <Link href="/" className="group flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2.5 shadow-[0_4px_20px_rgba(11,43,88,0.06)] border border-slate-100 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="FIKI Transit"
                width={48}
                height={48}
                className="h-11 w-11 object-contain"
                priority
              />
            </div>
            <span className="mt-3 text-2xl md:text-3xl font-black tracking-wider text-[#0b2b58]">
              FIKI TRANSIT
            </span>
          </Link>
          <span className="mt-1 text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-[#e5a00d]">
            {subtitle}
          </span>
        </div>

        {/* Content Card matching sample UI */}
        <div className="rounded-[32px] border border-slate-200/80 bg-white p-6 sm:p-10 md:p-12 shadow-[0_8px_30px_rgba(15,35,65,0.04)] min-h-[500px] w-full overflow-hidden">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
              <div className="h-4 bg-slate-100 rounded w-2/3"></div>
            </div>
          ) : content ? (
            <div 
              className="prose prose-slate max-w-none prose-headings:text-[#0b2b58] prose-a:text-[#173d76] prose-p:break-words prose-p:whitespace-pre-wrap break-words w-full overflow-hidden text-slate-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
              <p className="text-sm">No content available for this section.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
