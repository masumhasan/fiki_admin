"use client";

import { ArrowLeft, CarFront, DollarSign, Send, Tag } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

export default function QuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [base, setBase] = useState(65);
  const [miles, setMiles] = useState(18.5);
  const [rate, setRate] = useState(3.5);
  const [assist, setAssist] = useState(25);
  const [discount, setDiscount] = useState(10);
  const [notice, setNotice] = useState("");
  const tax = 8.5;
  const subtotal = base + miles * rate + assist;
  const total = (subtotal - discount) * (1 + tax / 100);
  const money = (v: number) => `$${v.toFixed(2)}`;
  return (
    <div className="pb-20">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-[-.03em] text-[#16345e]">
                Create Quotation
              </h1>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-600">
                Pending Review
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-[13px] text-[#72829a]">
              Review the ride request, calculate the transportation cost, and
              send the quotation to the passenger.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="flex h-9 items-center gap-2 rounded-lg border border-[#dce4ed] bg-white px-3 text-xs font-semibold text-[#52647e] transition hover:border-[#173d76]/30 hover:bg-[#f3f6fa] hover:text-[#173d76]"
              href={`/ride-requests/${id}`}
            >
              <ArrowLeft className="size-3.5" /> Back to Details
            </Link>
          </div>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section className="overflow-hidden rounded-xl border border-[#e1e6ee] bg-white shadow-[0_4px_14px_rgba(15,37,74,.04)]">
            <div className="flex items-center gap-2 border-b px-5 py-3">
              <span className="grid size-7 place-items-center rounded-full bg-[#edf2fb] text-[#365382]">
                <DollarSign />
              </span>
              <h2 className="text-sm font-bold text-[#2a3b54]">
                Price Calculation
              </h2>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-3">
              <Field
                label="Base Fare"
                value={base}
                setValue={setBase}
                prefix="$"
              />
              <Field
                label="Distance"
                value={miles}
                setValue={setMiles}
                suffix="miles"
              />
              <Field
                label="Additional Assistance Fee"
                value={rate}
                setValue={setRate}
                suffix="/ mi"
              />
              <Field label="Waiting Charge" value={64.75} readOnly prefix="$" />
              <Field
                label="Extra Services"
                value={assist}
                setValue={setAssist}
                prefix="$"
              />
              <Field
                label="Discount"
                value={discount}
                setValue={setDiscount}
                prefix="$"
              />
              <Field label="Tax (%)" value={tax} readOnly suffix="%" />
              <div className="md:col-span-3 rounded-xl border border-[#cdddf6] bg-[#eef5ff] p-5">
                <div className="flex items-center gap-2 text-blue-700">
                  <Tag className="size-5" />
                  <strong className="text-sm">Pricing Summary</strong>
                </div>
                <div className="mt-5 grid gap-3 text-sm text-[#71829b] md:grid-cols-2">
                  <div>
                    <p>
                      Base Fare{" "}
                      <b className="float-right text-[#172033]">
                        {money(base)}
                      </b>
                    </p>
                    <p className="mt-3">
                      Distance Cost ({miles} mi × ${rate.toFixed(2)}){" "}
                      <b className="float-right text-[#172033]">
                        {money(miles * rate)}
                      </b>
                    </p>
                    <p className="mt-3">
                      Wheelchair Assistance{" "}
                      <b className="float-right text-[#172033]">
                        {money(assist)}
                      </b>
                    </p>
                  </div>
                  <div>
                    <p>
                      Subtotal{" "}
                      <b className="float-right text-lg text-[#172033]">
                        {money(subtotal)}
                      </b>
                    </p>
                    <p className="mt-3">
                      Discount{" "}
                      <b className="float-right text-red-500">
                        − {money(discount)}
                      </b>
                    </p>
                    <p className="mt-3">
                      Tax ({tax}%){" "}
                      <b className="float-right text-[#172033]">
                        {money(((subtotal - discount) * tax) / 100)}
                      </b>
                    </p>
                  </div>
                </div>
                <div className="mt-5 border-t border-blue-200 pt-4">
                  <span className="text-sm font-bold uppercase tracking-wider text-blue-600">
                    Total Amount
                  </span>
                  <strong className="mt-1 block text-4xl font-bold text-[#1b4296]">
                    {money(total)}
                  </strong>
                </div>
              </div>
            </div>
          </section>
          <aside className="space-y-6">
            <article className="overflow-hidden rounded-xl border border-[#e1e6ee] bg-white shadow-[0_4px_14px_rgba(15,37,74,.04)]">
              <div className="bg-[#173d76] px-4 py-3 text-sm font-bold text-white">
                <CarFront className="mr-2 inline size-5" /> Ride Summary
              </div>
              <div className="space-y-4 p-4">
                {[
                  ["Ride ID", id],
                  ["Passenger Name", "Robert Mitchell"],
                  ["Pickup", "1247 Maple Street, Sacramento, CA"],
                  ["Destination", "UC Davis Medical Center"],
                  ["Trip Type", "Round Trip"],
                  ["Distance", "18.5 miles"],
                  ["Estimated Duration", "~34 minutes"],
                  ["Requested On", "Jul 12, 2026 · 11:42 AM"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#95a4b8]">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#2c3950]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-xl bg-[#173d76] p-5 text-white shadow-[0_4px_14px_rgba(15,37,74,.12)]">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                Quote Total
              </p>
              <strong className="mt-2 block text-4xl font-bold">
                {money(total)}
              </strong>
              <p className="mt-2 text-sm text-blue-100">
                Auto-calculated · updates in real-time
              </p>
              <div className="mt-6 space-y-3 border-t border-white/20 pt-5 text-sm">
                <p>
                  Subtotal{" "}
                  <span className="float-right">{money(subtotal)}</span>
                </p>
                <p>
                  Discount{" "}
                  <span className="float-right text-cyan-200">
                    − {money(discount)}
                  </span>
                </p>
                <p>
                  Tax ({tax}%){" "}
                  <span className="float-right">
                    {money(((subtotal - discount) * tax) / 100)}
                  </span>
                </p>
              </div>
            </article>
          </aside>
        </div>
      </div>
      <footer className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t bg-white px-6 py-3 shadow-[0_-4px_20px_rgba(15,37,74,.08)] lg:left-58.75">
        <div>
          <p className="text-sm text-[#8190a5]">Grand Total</p>
          <strong className="text-2xl text-[#172033]">{money(total)}</strong>
        </div>
        <div className="flex gap-3">
          <button
            className="h-9 rounded-lg border px-4 text-xs font-bold text-[#58677d] transition hover:border-[#173d76]/30 hover:bg-[#173d76]/5"
            onClick={() => setNotice("Quotation saved as a draft.")}
            type="button"
          >
            Save as Draft
          </button>
          <button
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#173d76] px-4 text-xs font-bold text-white shadow-md shadow-[#173d76]/20 transition hover:bg-[#0d2c58]"
            onClick={() =>
              setNotice("Quotation sent to Robert Mitchell for review.")
            }
            type="button"
          >
            <Send className="size-4" /> Send Quotation
          </button>
        </div>
      </footer>
      {notice ? (
        <div className="fixed bottom-18 right-5 z-40 rounded-lg bg-[#173d76] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {notice}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  setValue,
  prefix,
  suffix,
  readOnly = false,
}: {
  label: string;
  value: number;
  setValue?: (value: number) => void;
  prefix?: string;
  suffix?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="text-[12px] font-semibold text-[#58677d]">
      {label}
      <span className="relative mt-2 block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8493a8]">
          {prefix}
        </span>
        <input
          className={`h-10 w-full rounded-lg border border-[#dce5f0] bg-white text-[13px] font-semibold text-[#27344a] outline-none focus:border-[#173d76] focus:ring-4 focus:ring-[#173d76]/10 ${prefix ? "pl-8 pr-3" : suffix ? "pl-3 pr-16" : "px-3"}`}
          min="0"
          onChange={
            setValue ? (e) => setValue(Number(e.target.value)) : undefined
          }
          readOnly={readOnly}
          step="0.01"
          type="number"
          value={value}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8493a8]">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}
