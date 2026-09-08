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

const CRM_STYLES = `
.crm-rendered-content {
  box-sizing: border-box;
  color: #172033;
  font-size: 15px;
  line-height: 1.5;
  tab-size: 4;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Match Quill's exact margin-free spacing */
.crm-rendered-content p,
.crm-rendered-content ol,
.crm-rendered-content ul,
.crm-rendered-content pre,
.crm-rendered-content blockquote,
.crm-rendered-content h1,
.crm-rendered-content h2,
.crm-rendered-content h3,
.crm-rendered-content h4,
.crm-rendered-content h5,
.crm-rendered-content h6 {
  margin: 0;
  padding: 0;
}

/* Quill Heading Sizing */
.crm-rendered-content h1 {
  font-size: 2em;
  font-weight: 700;
  line-height: 1.25;
}
.crm-rendered-content h2 {
  font-size: 1.5em;
  font-weight: 700;
  line-height: 1.3;
}
.crm-rendered-content h3 {
  font-size: 1.17em;
  font-weight: 700;
  line-height: 1.35;
}
.crm-rendered-content h4 {
  font-size: 1em;
  font-weight: 600;
  line-height: 1.4;
}
.crm-rendered-content h5 {
  font-size: 0.83em;
  font-weight: 600;
}
.crm-rendered-content h6 {
  font-size: 0.67em;
  font-weight: 600;
}

/* Empty lines / spacing from Quill editor */
.crm-rendered-content p:empty,
.crm-rendered-content p > br:only-child {
  min-height: 1.5em;
}

/* Quill Text Alignments */
.crm-rendered-content .ql-align-center {
  text-align: center;
}
.crm-rendered-content .ql-align-right {
  text-align: right;
}
.crm-rendered-content .ql-align-justify {
  text-align: justify;
}

/* Quill Font Sizes */
.crm-rendered-content .ql-size-small {
  font-size: 0.75em;
}
.crm-rendered-content .ql-size-large {
  font-size: 1.5em;
}
.crm-rendered-content .ql-size-huge {
  font-size: 2.5em;
}

/* Quill Fonts */
.crm-rendered-content .ql-font-serif {
  font-family: Georgia, Times New Roman, serif;
}
.crm-rendered-content .ql-font-monospace {
  font-family: Monaco, Courier New, monospace;
}

/* Quill Lists */
.crm-rendered-content ol {
  list-style-type: decimal;
  padding-left: 1.5em;
}
.crm-rendered-content ul {
  list-style-type: disc;
  padding-left: 1.5em;
}
.crm-rendered-content li {
  padding-left: 0.25em;
}

/* Quill Indents */
.crm-rendered-content .ql-indent-1 { padding-left: 3em; }
.crm-rendered-content .ql-indent-2 { padding-left: 6em; }
.crm-rendered-content .ql-indent-3 { padding-left: 9em; }
.crm-rendered-content .ql-indent-4 { padding-left: 12em; }
.crm-rendered-content .ql-indent-5 { padding-left: 15em; }
.crm-rendered-content .ql-indent-6 { padding-left: 18em; }
.crm-rendered-content .ql-indent-7 { padding-left: 21em; }
.crm-rendered-content .ql-indent-8 { padding-left: 24em; }

/* Quill Blockquotes */
.crm-rendered-content blockquote {
  border-left: 4px solid #cbd5e1;
  padding-left: 16px;
  color: #64748b;
  font-style: italic;
}

/* Quill Links */
.crm-rendered-content a {
  color: #173d76;
  text-decoration: underline;
}
`;

export function CrmViewer({ section, title }: CrmViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const cleanHtml = (str: string): string => {
    if (!str) return "";
    return str.replace(/&nbsp;/g, " ").replace(/\u00A0/g, " ");
  };

  const normalizeSection = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return cleanHtml(val);
    if (typeof val === "object") {
      const parts = [val.general, val.passengers, val.drivers].filter(
        (p) => p && typeof p === "string" && p.trim() !== ""
      );
      if (parts.length === 0) return "";
      return cleanHtml(Array.from(new Set(parts)).join("<br/><br/>"));
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
    <div className="min-h-screen bg-[#f4f7fb] py-10 px-4 sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px]">
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
        <div className="rounded-[32px] border border-slate-200/80 bg-white p-6 sm:p-10 md:p-14 lg:p-16 shadow-[0_8px_30px_rgba(15,35,65,0.04)] min-h-[550px] w-full">
          <style dangerouslySetInnerHTML={{ __html: CRM_STYLES }} />
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
              <div className="h-4 bg-slate-100 rounded w-2/3"></div>
            </div>
          ) : content ? (
            <div 
              className="crm-rendered-content w-full"
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
