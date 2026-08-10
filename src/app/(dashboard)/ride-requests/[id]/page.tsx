import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartPulse,
  MapPin,
  Route,
  Send,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

const card =
  "overflow-hidden rounded-xl border border-[#e1e6ee] bg-white shadow-[0_4px_14px_rgba(15,37,74,.04)]";
const fields = [
  ["Full name", "Sarah Mitchell"],
  ["Relationship to rider", "Daughter"],
  ["Email address", "sarah.mitchell@email.com"],
  ["Phone number", "(916) 234-5678"],
];

export default async function RideRequestDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="pb-20">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-[-.03em] text-[#16345e]">
            Ride Request Review
          </h1>
          <p className="mt-1 text-[13px] text-[#7e8b9e]">
            Review complete passenger transportation request before approval and
            driver assignment.
          </p>
        </div>
        <Link
          className="flex h-9 items-center gap-2 rounded-lg border border-[#dce4ed] bg-white px-3 text-xs font-semibold text-[#52647e] transition hover:border-[#173d76]/30 hover:bg-[#f3f6fa] hover:text-[#173d76]"
          href="/ride-requests"
        >
          <ArrowLeft className="size-3.5" /> Back to Ride Requests
        </Link>
      </header>
      <section
        className={`${card} mb-4 grid gap-4 p-4 sm:grid-cols-3 xl:grid-cols-6`}
      >
        <Status
          icon={<ClipboardCheck />}
          label="Status"
          value="Pending Approval"
          tone="amber"
        />
        <Status label="Request ID" value={id} />
        <Status label="Submitted" value="Jul 12, 2026 at 9:14 AM" />
        <Status label="Priority" value="High" tone="amber" />
        <Status label="Ride type" value="Round Trip" tone="blue" />
        <Status label="Schedule" value="Recurring Weekly" tone="violet" />
      </section>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <main className="space-y-4">
          <InfoCard
            icon={<UsersRound />}
            title="Requester Information"
            subtitle="Person requesting transportation"
            fields={fields}
          />
          <InfoCard
            icon={<UserRound />}
            title="Passenger Information"
            subtitle="Passenger personal and contact details"
            fields={[
              ["Full name", "Robert Mitchell"],
              ["Date of birth", "March 15, 1945"],
              ["Phone number", "(916) 123-4567"],
              ["Email address", "robert.morrison@email.com"],
              ["Street address", "1247 Maple Street"],
              ["City", "Sacramento"],
              ["State", "CA"],
              ["Zip code", "95814"],
              ["Door confirmed", "Confirmed by Requester"],
            ]}
          />
          <article className={card}>
            <CardHead
              icon={<Send />}
              title="Trip Information"
              subtitle="Schedule, route and destination details"
            />
            <div className="grid gap-4 p-4 md:grid-cols-3">
              <Label value="Round Trip" label="Trip type" pill />
              <Label
                value="Recurring Weekly"
                label="Transportation schedule"
                pill
              />
              <Label value="9:00 AM" label="Pickup time" />
              <Label value="10:30 AM" label="Appointment time" />
              <Label value="Jul 14, 2026" label="Start date" />
              <Label value="Dec 31, 2026" label="End date" />
            </div>
            <div className="border-t p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#8190a5]">
                Recurring days
              </p>
              <div className="mt-2 flex gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-bold ${["Mon", "Wed", "Fri"].includes(day) ? "bg-[#173d76] text-white" : "bg-[#f0f3f7] text-[#8390a2]"}`}
                      key={day}
                    >
                      {day}
                    </span>
                  ),
                )}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <MapBox
                  label="Pickup address"
                  address="1247 Maple Street, Sacramento, CA 95814"
                />
                <MapBox
                  label="Destination address"
                  address="UC Davis Medical Center, 2315 Stockton Blvd, Sacramento, CA 95817"
                />
              </div>
            </div>
            <div className="grid gap-4 border-t p-4 md:grid-cols-3">
              <Label label="Return pickup time" value="12:30 PM" />
              <Label
                label="Return pickup address"
                value="UC Davis Medical Center, 2315 Stockton Blvd"
              />
              <Label
                label="Return destination"
                value="1247 Maple Street, Sacramento, CA 95814"
              />
            </div>
          </article>
          <article className={card}>
            <CardHead
              icon={<HeartPulse />}
              title="Mobility & Special Needs"
              subtitle="Accessibility requirements and driver instructions"
            />
            <div className="space-y-3 p-4">
              <div>
                <p className="text-[11px] font-bold uppercase text-[#8190a5]">
                  Selected accommodations
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    "Wheelchair",
                    "Wheelchair Securement",
                    "Personal Care Attendant",
                    "Transfer From Wheelchair",
                  ].map((x) => (
                    <span
                      className="rounded-full bg-[#edf2fb] px-2 py-1 text-[11px] font-semibold text-[#365382]"
                      key={x}
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </div>
              <Notice
                title="Additional driver notes"
                body="Passenger requires full transfer assistance. Please ensure hydraulic lift-equipped vehicle. Driver must confirm pickup at door."
              />
              <Notice
                title="Special instructions"
                body="Patient has limited upper body mobility. Needs assistance with seat belt."
                gray
              />
            </div>
          </article>
          <InfoCard
            icon={<ShieldCheck />}
            title="Insurance / Payment Information"
            subtitle="Funding source and authorization details"
            fields={[
              ["Funding source", "Government Program"],
              ["Broker / insurance name", "Medi-Cal"],
              ["Authorization number", "AUTH- 2826-78234"],
              ["Member ID", "ACB123456789"],
              [
                "Insurance provider",
                "Anthem Blue Cross (Medi-Cal Managed Care)",
              ],
            ]}
          />
          <InfoCard
            icon={<UserRound />}
            title="Guardian Information"
            subtitle="Legal guardian or authorized representative"
            fields={fields}
          />
          <article className={card}>
            <CardHead
              icon={<ClipboardCheck />}
              title="Consents & Agreements"
              subtitle="Digital acknowledgments captured at submission"
            />
            <div className="space-y-2 p-4">
              {[
                "Passenger Electronic Signature Consent",
                "Passenger Photo Authorization",
                "Passenger Privacy Acknowledgment (HIPAA)",
                "Passenger Transportation Agreement",
              ].map((x) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2"
                  key={x}
                >
                  <span className="flex items-center gap-2 text-[12px] font-semibold text-[#365b45]">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    {x}
                  </span>
                  <span className="text-[11px] text-emerald-600">
                    Accepted · Jul 12, 2026
                  </span>
                </div>
              ))}
            </div>
          </article>
          <article className={card}>
            <CardHead
              icon={<FileText />}
              title="Digital Signature"
              subtitle="Electronically captured at time of submission"
            />
            <div className="grid gap-4 p-4 md:grid-cols-[1fr_180px]">
              <div className="grid h-22 place-items-center rounded-xl border bg-[#f7f9fc] text-sm font-bold italic text-[#7790b6]">
                Sarah Mitchell
              </div>
              <div className="space-y-2 text-[13px]">
                <Label label="Signed date" value="Jul 12, 2026 at 9:14 AM" />
                <Label label="Relationship" value="Daughter / Legal Guardian" />
              </div>
            </div>
          </article>
          <article className={card}>
            <CardHead
              icon={<Route />}
              title="Activity Timeline"
              subtitle="End-to-end request lifecycle"
            />
            <div className="space-y-3 p-4">
              {[
                "Ride Request Submitted",
                "Admin Viewed",
                "Pending Admin Approval",
                "Driver Assigned",
                "Ride Scheduled",
                "Ride Started",
                "Passenger Picked Up",
                "Completed",
              ].map((x, i) => (
                <div className="flex gap-3 text-[13px]" key={x}>
                  <span
                    className={`grid size-5 place-items-center rounded-full ${i < 2 ? "bg-emerald-500 text-white" : i === 2 ? "bg-amber-400 text-white" : "border border-[#dbe2eb] text-[#a5b0c0]"}`}
                  >
                    {i < 2 ? "✓" : i === 2 ? "•" : ""}
                  </span>
                  <div>
                    <p
                      className={`font-semibold ${i < 3 ? "text-[#354255]" : "text-[#a1abb9]"}`}
                    >
                      {x}
                    </p>
                    {i === 0 && (
                      <p className="text-[#9aa5b5]">Jul 12, 2026 at 9:14 AM</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
          <InfoCard
            icon={<FileText />}
            title="System Information"
            subtitle="Submission metadata and device details"
            fields={[
              ["Created at", "Jul 12, 2026 — 9:14:03 AM"],
              ["Updated at", "Jul 12, 2026 — 10:02:44 AM"],
              ["Last modified by", "James Torres (Admin)"],
              ["Source", "Web"],
              ["IP address", "198.51.100.42"],
              ["Browser", "Chrome 126.0"],
              ["Device", "Desktop — macOS 14.5"],
            ]}
          />
        </main>
        <aside className="space-y-4">
          <article className={card}>
            <div className="bg-[#173d76] px-4 py-3 text-sm font-bold text-white">
              Quick Summary
            </div>
            <div className="space-y-3 p-4">
              {[
                ["Passenger", "Robert Mitchell"],
                ["Phone", "(916) 123-4567"],
                ["Pickup", "1247 Maple St, Sacramento"],
                ["Destination", "UC Davis Medical Center"],
                ["Service date", "Jul 14, 2026"],
                ["Appointment", "10:30 AM"],
                ["Driver status", "Unassigned"],
                ["Ride type", "Round Trip"],
                ["Mobility", "Wheelchair"],
                ["Est. distance", "4.2 miles"],
                ["Est. duration", "18 min"],
              ].map(([a, b]) => (
                <Label label={a} value={b} key={a} />
              ))}
            </div>
            <div className="border-t px-4 py-3 text-[11px] font-bold text-amber-600">
              • Pending Approval
            </div>
          </article>
          <article className={`${card} p-4`}>
            <p className="text-[11px] font-bold uppercase text-[#8190a5]">
              Submitted by
            </p>
            <p className="mt-2 text-sm font-bold">Sarah Mitchell</p>
            <p className="text-[12px] text-[#8090a5]">
              Daughter · sarah.mitchell@email.com
            </p>
          </article>
          <article className={`${card} p-4`}>
            <h2 className="text-sm font-bold">Assign Driver</h2>
            <p className="mt-1 text-[12px] text-[#8090a5]">
              Select driver, vehicle and schedule
            </p>
            <div className="mt-4 space-y-3">
              {["Assign driver", "Assign vehicle", "Assign schedule"].map(
                (x) => (
                  <select
                    className="h-10 w-full rounded-lg border bg-[#fafbfd] px-3 text-[12px] text-[#8290a3]"
                    key={x}
                  >
                    <option>{x}</option>
                  </select>
                ),
              )}
              <button
                className="h-9 w-full rounded-lg bg-[#173d76] text-xs font-bold text-white"
                type="button"
              >
                Confirm Assignment
              </button>
            </div>
          </article>
        </aside>
      </div>
      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white/95 px-4 py-3 backdrop-blur lg:left-58.75">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
          <span className="text-[11px] text-[#7c8798]">
            Request <strong className="text-[#173d76]">{id}</strong> — Awaiting
            admin decision
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-lg border px-3 py-2 text-[11px] font-semibold"
              type="button"
            >
              Download PDF
            </button>
            <button
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600"
              type="button"
            >
              Reject Request
            </button>
            <Link
              className="rounded-lg bg-[#173d76] px-4 py-2 text-[11px] font-bold text-white"
              href={`/ride-requests/${id}/quotation`}
            >
              Send Quotation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CardHead({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="flex items-center gap-2 border-b px-4 py-3">
      <span className="grid size-6 place-items-center rounded-full bg-[#edf2fb] text-[#365382] [&_svg]:size-3.5">
        {icon}
      </span>
      <div>
        <h2 className="text-sm font-bold text-[#2a3b54]">{title}</h2>
        <p className="text-[11px] text-[#8a97aa]">{subtitle}</p>
      </div>
    </header>
  );
}
function InfoCard({
  icon,
  title,
  subtitle,
  fields,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  fields: string[][];
}) {
  return (
    <article className={card}>
      <CardHead icon={icon} title={title} subtitle={subtitle} />
      <div className="grid gap-x-8 gap-y-4 p-4 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <Label label={label} value={value} key={label} />
        ))}
      </div>
    </article>
  );
}
function Label({
  label,
  value,
  pill = false,
  tone = "blue",
}: {
  label: string;
  value: string;
  pill?: boolean;
  tone?: "blue" | "amber" | "violet" | "green" | "red";
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#8a98aa]">
        {label}
      </p>
      <p
        className={`mt-1 text-[13px] font-semibold text-[#34435a] ${pill ? `inline-block rounded px-2 py-0.5 ${tone === "amber" ? "bg-amber-50 text-amber-700" : tone === "violet" ? "bg-violet-50 text-violet-700" : tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "red" ? "bg-rose-50 text-rose-700" : "bg-[#eaf1ff] text-[#3560ab]"}` : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
function Status({
  icon,
  label,
  value,
  tone,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  tone?: "blue" | "amber" | "violet" | "green" | "red";
}) {
  return (
    <div className="flex gap-2">
      <span
        className={`mt-1 [&_svg]:size-4 ${tone === "amber" ? "text-amber-500" : tone === "violet" ? "text-violet-500" : tone === "green" ? "text-emerald-500" : "text-blue-500"}`}
      >
        {icon}
      </span>
      <Label label={label} value={value} pill={Boolean(tone)} tone={tone} />
    </div>
  );
}
function MapBox({ label, address }: { label: string; address: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase text-[#8190a5]">{label}</p>
      <div className="mt-2 grid h-24 place-items-center rounded-xl border bg-[#f1f5fb] text-center">
        <MapPin className="size-5 text-[#f5b000]" />
        <p className="px-4 text-[11px] text-[#8b98aa]">{address}</p>
        <button
          className="rounded-full bg-[#173d76] px-3 py-1 text-[10px] text-white"
          type="button"
        >
          Open in Maps
        </button>
      </div>
    </div>
  );
}
function Notice({
  title,
  body,
  gray = false,
}: {
  title: string;
  body: string;
  gray?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${gray ? "border-[#dbe4ef] bg-[#eef3f9]" : "border-amber-100 bg-amber-50"}`}
    >
      <p className="text-[11px] font-bold text-[#80631c]">{title}</p>
      <p className="mt-1 text-[12px] text-[#607085]">{body}</p>
    </div>
  );
}
