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
  color: #1e293b;
  font-size: 0.95rem;
  line-height: 1.7;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Quill Alignments */
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
  font-size: 0.8rem;
}
.crm-rendered-content .ql-size-large {
  font-size: 1.35rem;
  font-weight: 600;
}
.crm-rendered-content .ql-size-huge {
  font-size: 1.85rem;
  font-weight: 700;
}

/* Quill Fonts */
.crm-rendered-content .ql-font-serif {
  font-family: Georgia, Times New Roman, serif;
}
.crm-rendered-content .ql-font-monospace {
  font-family: Monaco, Courier New, monospace;
}

/* Headings */
.crm-rendered-content h1 {
  font-size: 1.85rem;
  font-weight: 800;
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}
.crm-rendered-content h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.6rem;
  line-height: 1.35;
}
.crm-rendered-content h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}
.crm-rendered-content h4 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.4rem;
  line-height: 1.45;
}
.crm-rendered-content h5 {
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 0.85rem;
  margin-bottom: 0.35rem;
}
.crm-rendered-content h6 {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
}

/* Paragraphs */
.crm-rendered-content p {
  margin-bottom: 0.85rem;
  line-height: 1.7;
}

/* Lists */
.crm-rendered-content ol {
  list-style-type: decimal;
  padding-left: 1.75rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}
.crm-rendered-content ul {
  list-style-type: disc;
  padding-left: 1.75rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}
.crm-rendered-content li {
  margin-bottom: 0.35rem;
  line-height: 1.6;
}

/* Indents */
.crm-rendered-content .ql-indent-1 { padding-left: 2rem; }
.crm-rendered-content .ql-indent-2 { padding-left: 4rem; }
.crm-rendered-content .ql-indent-3 { padding-left: 6rem; }
.crm-rendered-content .ql-indent-4 { padding-left: 8rem; }
.crm-rendered-content .ql-indent-5 { padding-left: 10rem; }
.crm-rendered-content .ql-indent-6 { padding-left: 12rem; }
.crm-rendered-content .ql-indent-7 { padding-left: 14rem; }
.crm-rendered-content .ql-indent-8 { padding-left: 16rem; }

/* Blockquotes */
.crm-rendered-content blockquote {
  border-left: 4px solid #173d76;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #475569;
  font-style: italic;
}

/* Links */
.crm-rendered-content a {
  color: #173d76;
  text-decoration: underline;
  transition: opacity 0.2s;
}
.crm-rendered-content a:hover {
  opacity: 0.8;
}

/* Clean up empty paragraphs that Quill creates as spacers */
.crm-rendered-content p:empty {
  min-height: 1rem;
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
