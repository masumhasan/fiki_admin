"use client";

import {
  Activity,
  AlertTriangle,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileCheck2,
  Loader2,
  Mail,
  Phone,
  Search,
  Trash2,
  Users,
  X,
  IdCard,
  CalendarDays,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  getAdminDriversApi,
  deleteDriverApi,
  updateDriverProfileApi,
} from "@/lib/api";

type DriverStatus = "Active" | "On trip" | "Off duty";

type Driver = {
  id: string;
  mongoId: string;
  name: string;
  email: string;
  initials: string;
  avatar: string;
  joined: string;
  status: DriverStatus;
  vehicle: string;
  plate: string;
  phone: string;
  trips: number;
  rating: string;
  licenseNumber: string;
  licenseExpirationDate: string;
  rawLicenseExpirationDate: string;
};

export function DriversPage({ hideHeader }: { hideHeader?: boolean } = {}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | DriverStatus>("All");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await getAdminDriversApi(token, {
        approvalStatus: "APPROVED",
      });
      if (res.success && res.data && res.data.drivers) {
        const statusMap: Record<string, DriverStatus> = {
          ONLINE: "Active",
          ASSIGNED: "On trip",
          OFFLINE: "Off duty",
          UNAVAILABLE: "Off duty",
        };

        const mapped: Driver[] = res.data.drivers
          .filter(
            (d: any) => d.profile && d.profile.approvalStatus === "APPROVED",
          )
          .map((d: any, idx: number) => {
            const profile = d.profile || {};
            const status = statusMap[profile.availabilityStatus] ?? "Off duty";

            const vehicleMake = profile.vehicle?.make?.trim() || "";
            const vehicleModel = profile.vehicle?.model?.trim() || "";
            const vehicleStr =
              [vehicleMake, vehicleModel].filter(Boolean).join(" ") || "—";
            const plateStr = profile.vehicle?.licensePlate?.trim() || "—";

            const nameParts = (d.name || "Driver").split(" ");
            const initials =
              nameParts.length >= 2
                ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                : (d.name || "DR").substring(0, 2).toUpperCase();

            let expiryStr = "—";
            if (profile.licenseExpirationDate) {
              const d = new Date(profile.licenseExpirationDate);
              if (!isNaN(d.getTime())) {
                expiryStr = d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                });
              } else {
                expiryStr = profile.licenseExpirationDate;
              }
            }

            return {
              id: `D-${String(idx + 1).padStart(3, "0")}`,
              mongoId: d.id || d._id,
              name: d.name || "Driver",
              email: d.email || "",
              initials,
              avatar: "bg-primary",
              joined: d.createdAt
                ? new Date(d.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "—",
              status,
              vehicle: vehicleStr,
              plate: plateStr,
              phone: d.phone?.trim() || "—",
              trips: profile.completedTripsCount || 0,
              rating: profile.rating ? String(profile.rating) : "—",
              licenseNumber: profile.licenseNumber || "—",
              licenseExpirationDate: expiryStr,
              rawLicenseExpirationDate: profile.licenseExpirationDate || "",
            };
          });
        setDrivers(mapped);
      } else {
        setDrivers([]);
      }
    } catch {
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleOpenDeleteModal = (driver: Driver) => {
    setDriverToDelete(driver);
    setDeleteConfirmInput("");
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!driverToDelete || deleteConfirmInput.trim() !== "DELETE") return;
    setDeleting(true);
    setDeleteError("");
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) return;
    const res = await deleteDriverApi(token, driverToDelete.mongoId);
    if (res.success) {
      setDriverToDelete(null);
      setDeleteConfirmInput("");
      await fetchDrivers();
    } else {
      setDeleteError(res.error?.message || "Failed to delete driver.");
    }
    setDeleting(false);
  };

  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    licenseNumber: "",
    licenseExpirationDate: "",
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const handleOpenEditModal = (driver: Driver) => {
    setDriverToEdit(driver);
    setEditForm({
      name: driver.name,
      phone: driver.phone === "—" ? "" : driver.phone,
      email: driver.email,
      licenseNumber: driver.licenseNumber === "—" ? "" : driver.licenseNumber,
      licenseExpirationDate: driver.rawLicenseExpirationDate,
    });
    setUpdateError("");
  };

  const handleConfirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverToEdit) return;
    setUpdating(true);
    setUpdateError("");

    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setUpdateError("Authentication token not found.");
      setUpdating(false);
      return;
    }

    const res = await updateDriverProfileApi(
      token,
      driverToEdit.mongoId,
      editForm,
    );
    if (res.success) {
      setDriverToEdit(null);
      await fetchDrivers();
    } else {
      setUpdateError(res.error?.message || "Failed to update driver profile.");
    }
    setUpdating(false);
  };

  const filteredDrivers = useMemo(
    () =>
      drivers.filter(
        (driver) =>
          (filter === "All" || driver.status === filter) &&
          [driver.name, driver.id, driver.vehicle, driver.plate].some((value) =>
            value.toLowerCase().includes(query.toLowerCase()),
          ),
      ),
    [drivers, filter, query],
  );

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <PageHeader
          title="Drivers"
          description={
            loading
              ? "Loading drivers…"
              : `${drivers.length} registered driver${drivers.length !== 1 ? "s" : ""}`
          }
          action={
            <Link
              className="flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-[#0d2c58]"
              href="/drivers/applications"
            >
              View new requests
            </Link>
          }
        />
      )}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        <Summary
          label="Total drivers"
          value={loading ? null : drivers.length}
          tone="text-primary"
        />
        <Summary
          label="Active now"
          value={
            loading ? null : drivers.filter((d) => d.status === "Active").length
          }
          tone="text-emerald-500"
        />
        <Summary
          label="On trip"
          value={
            loading
              ? null
              : drivers.filter((d) => d.status === "On trip").length
          }
          tone="text-blue-500"
        />
        <Summary
          label="Off duty"
          value={
            loading
              ? null
              : drivers.filter((d) => d.status === "Off duty").length
          }
          tone="text-brand-placeholder"
        />
      </section>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-icon" />
          <input
            className="h-10 w-full rounded-lg border border-input bg-muted pl-11 pr-4 text-sm outline-none placeholder:text-brand-placeholder focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search driver, vehicle or plate..."
            value={query}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto sm:ml-auto">
          {(["All", "Active", "On trip", "Off duty"] as const).map((item) => (
            <button
              className={`h-9 whitespace-nowrap rounded-lg px-3 text-xs font-bold ${filter === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      {loading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary/50" />
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 text-center">
          <Users className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-muted-foreground">
            {drivers.length === 0
              ? "No drivers registered yet"
              : "No drivers match your search"}
          </p>
          {drivers.length === 0 && (
            <p className="text-xs text-muted-foreground/70">
              Approved driver applications will appear here.
            </p>
          )}
        </div>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDrivers.map((driver) => (
            <DriverCard
              driver={driver}
              key={driver.mongoId}
              onDelete={() => handleOpenDeleteModal(driver)}
              onEdit={handleOpenEditModal}
            />
          ))}
        </section>
      )}

      {/* Delete Driver Confirmation Modal */}
      {driverToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2 text-destructive">
                <Trash2 className="size-5" />
                <h3 className="text-base font-bold text-foreground">
                  Delete Driver
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDriverToDelete(null)}
                className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <p className="text-xs leading-5 text-muted-foreground">
                Are you sure you want to delete{" "}
                <strong className="text-foreground">
                  {driverToDelete.name}
                </strong>{" "}
                ({driverToDelete.id})? This action cannot be undone and will
                permanently remove their driver record.
              </p>

              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Confirmation Required</span>
                </div>
                <p className="leading-5">
                  To confirm deletion, please type{" "}
                  <strong className="underline">DELETE</strong> in the field
                  below.
                </p>
              </div>

              {deleteError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  {deleteError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold uppercase tracking-wider outline-none focus:border-destructive focus:ring-2 focus:ring-destructive/10"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setDriverToDelete(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmInput.trim() !== "DELETE" || deleting}
                onClick={handleConfirmDelete}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-destructive px-5 text-xs font-bold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Driver Profile Modal */}
      {driverToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Pencil className="size-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  Edit Driver Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDriverToEdit(null)}
                className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmEdit} className="py-4 space-y-4">
              {updateError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  {updateError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Driver License
                  </label>
                  <input
                    type="text"
                    value={editForm.licenseNumber}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        licenseNumber: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    License Expiry Date
                  </label>
                  <input
                    type="date"
                    value={editForm.licenseExpirationDate}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        licenseExpirationDate: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition animate-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setDriverToEdit(null)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground transition hover:bg-primary/95 shadow-sm"
                >
                  {updating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Summary({
  label,
  tone,
  value,
}: {
  label: string;
  tone: string;
  value: number | null;
}) {
  return (
    <article className="rounded-xl border border-[#e1e6ee] bg-card p-5 shadow-[0_4px_14px_rgba(15,37,74,.04)]">
      <p className="text-xs font-semibold text-muted-foreground sm:text-sm">
        {label}
      </p>
      <p
        className={`mt-2 text-4xl font-bold leading-none tracking-[-.04em] ${tone}`}
      >
        {value === null ? (
          <span className="inline-block h-9 w-8 animate-pulse rounded bg-muted" />
        ) : (
          value
        )}
      </p>
    </article>
  );
}

function DriverCard({
  driver,
  onDelete,
  onEdit,
}: {
  driver: Driver;
  onDelete: (id: string) => void;
  onEdit: (driver: Driver) => void;
}) {
  return (
    <article className="rounded-xl border border-[#e1e6ee] bg-card p-5 shadow-[0_4px_14px_rgba(15,37,74,.04)]">
      <div className="flex items-start justify-between">
        <span
          className={`grid size-14 place-items-center rounded-full text-lg font-bold text-white ${driver.avatar}`}
        >
          {driver.initials}
        </span>
        <div className="flex items-center gap-2">
          <DriverStatus status={driver.status} />
        </div>
      </div>
      <h2 className="mt-5 text-lg font-bold text-foreground">{driver.name}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {driver.id} · Since {driver.joined}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
        <DriverInfo icon={CarFront} label="Vehicle" value={driver.vehicle} />
        <DriverInfo icon={FileCheck2} label="Plate" value={driver.plate} />
        <DriverInfo icon={Phone} label="Phone" value={driver.phone} />
        <DriverInfo
          icon={Activity}
          label="Trips"
          value={`${driver.trips} this week`}
        />
        <DriverInfo
          icon={IdCard}
          label="License"
          value={driver.licenseNumber}
        />
        <DriverInfo
          icon={CalendarDays}
          label="Expiry"
          value={driver.licenseExpirationDate}
        />
      </dl>
      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => onDelete(driver.mongoId || driver.id)}
          className="flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-3 text-xs font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700 cursor-pointer"
        >
          <Trash2 className="size-4" />
          Delete
        </button>
        <button
          type="button"
          onClick={() => onEdit(driver)}
          className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground transition hover:bg-muted cursor-pointer"
        >
          <Pencil className="size-4" />
          Edit
        </button>
        <div className="ml-auto">
          <Link
            className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold text-primary transition hover:bg-muted"
            href={`/drivers/${driver.mongoId || driver.id}`}
          >
            <Eye className="size-4" />
            View profile
          </Link>
        </div>
      </div>
    </article>
  );
}

function DriverInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CarFront;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd
        className="mt-1.5 truncate font-semibold text-foreground"
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function DriverStatus({ status }: { status: DriverStatus }) {
  const style = {
    Active: "bg-emerald-50 text-emerald-700",
    "On trip": "bg-blue-50 text-blue-600",
    "Off duty": "bg-slate-100 text-brand-muted",
  }[status];
  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${style}`}>
      {status}
    </span>
  );
}

import { getDriverApplicationsApi } from "@/lib/api";

type Application = {
  id: string;
  mongoId: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  license: string;
  start: string;
  background: string;
  submitted: string;
  status: string;
};

export function ApplicationsTable() {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [tab, setTab] = useState("All");
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getDriverApplicationsApi(token)
      .then((res) => {
        if (res.success && res.data && Array.isArray(res.data)) {
          const mapped: Application[] = res.data.map((a: any) => ({
            id: a.applicationId || `APP-${String(a._id).slice(-4)}`,
            mongoId: a._id || a.applicationId,
            name: a.fullName || "Applicant",
            phone: a.phone || "—",
            email: a.email || "—",
            type: a.positionType
              ? a.positionType.charAt(0) + a.positionType.slice(1).toLowerCase()
              : "—",
            license: a.licenseNumber || "—",
            start: a.submittedDate
              ? new Date(a.submittedDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—",
            background:
              a.backgroundStatus === "CLEARED"
                ? "Cleared"
                : a.backgroundStatus === "FAILED"
                  ? "Failed"
                  : "Pending",
            submitted: a.createdAt
              ? new Date(a.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—",
            status:
              a.status === "APPROVED"
                ? "Approved"
                : a.status === "REJECTED"
                  ? "Rejected"
                  : a.status === "INTERVIEW_SCHEDULED"
                    ? "Interview scheduled"
                    : "Pending review",
          }));
          setApps(mapped);
        } else {
          setApps([]);
        }
      })
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const tabs = ["All", "Pending", "Rejected", "Archived"];
  const filtered = apps.filter(
    (item) =>
      (tab === "All" ||
        (tab === "Pending"
          ? item.status.includes("Pending") ||
            item.status.includes("Interview") ||
            item.status.includes("Missing")
          : tab === "Rejected"
            ? item.status === "Rejected"
            : false)) &&
      [item.name, item.id, item.email, item.status].some((value) =>
        value.toLowerCase().includes(query.toLowerCase()),
      ),
  );
  const visible = filtered.slice(0, pageSize);

  return (
    <section className="overflow-hidden rounded-xl border border-[#e1e6ee] bg-card shadow-[0_4px_14px_rgba(15,37,74,.04)]">
      <header className="flex items-center justify-between border-b border-border px-5 py-3.5 sm:px-6">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-icon" />
            <input
              className="h-10 w-full rounded-lg border border-input bg-muted pl-10 pr-3 text-sm outline-none focus:border-primary focus:bg-card"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search applicants..."
              type="search"
              value={query}
            />
          </div>
          <div className="flex gap-1">
            {tabs.map((item) => (
              <button
                className={`h-9 rounded-lg px-3 text-xs font-bold ${tab === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                key={item}
                onClick={() => setTab(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="size-7 animate-spin text-primary/50" />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            {apps.length === 0
              ? "No applications received yet"
              : "No applications match your search"}
          </p>
          {apps.length === 0 && (
            <p className="text-xs text-muted-foreground/70">
              Submitted driver job applications will appear here.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-280 text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/55 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  <th className="px-6 py-3.5">Applicant</th>
                  <th>Contact</th>
                  <th>Position</th>
                  <th>License</th>
                  <th>Start date</th>
                  <th>Background</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr
                    className="border-b border-border/80 last:border-0 hover:bg-muted/30"
                    key={item.id}
                  >
                    <td className="px-6 py-4">
                      <strong className="block text-sm text-foreground">
                        {item.name}
                      </strong>
                      <span className="text-[10px] text-brand-placeholder">
                        {item.id}
                      </span>
                    </td>
                    <td>
                      <span className="block text-foreground">
                        {item.phone}
                      </span>
                      <span className="mt-1 block text-[10px] text-brand-placeholder">
                        {item.email}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium text-foreground">
                        Driver — {item.type}
                      </span>
                      <span className="mt-1 block w-fit rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600">
                        Full time
                      </span>
                    </td>
                    <td className="text-muted-foreground">{item.license}</td>
                    <td className="text-muted-foreground">{item.start}</td>
                    <td>
                      <ApplicationBadge value={item.background} />
                    </td>
                    <td className="text-muted-foreground">{item.submitted}</td>
                    <td>
                      <ApplicationBadge value={item.status} />
                    </td>
                    <td>
                      <Link
                        aria-label={`View ${item.name}`}
                        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                        href={`/drivers/applications/${item.id}`}
                      >
                        <Eye className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-border lg:hidden">
            {visible.map((item) => (
              <article className="p-5" key={item.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{item.name}</h3>
                    <p className="mt-1 text-[10px] text-brand-placeholder">
                      {item.id}
                    </p>
                  </div>
                  <ApplicationBadge value={item.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <p>
                    <Mail className="mr-1 inline size-3 text-brand-icon" />
                    {item.email}
                  </p>
                  <p>{item.type}</p>
                  <p>{item.license}</p>
                  <p>{item.start}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            Rows{" "}
            <select
              className="h-9 rounded-lg border border-border bg-card px-2 text-xs font-semibold text-foreground"
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </label>
          <span>
            Showing {visible.length} of {filtered.length} applications
          </span>
        </div>
        <div className="flex gap-1">
          <button
            className="grid size-8 place-items-center rounded-lg border border-border"
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"
            type="button"
          >
            1
          </button>
          <button
            className="grid size-8 place-items-center rounded-lg border border-border"
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </footer>
    </section>
  );
}

function ApplicationBadge({ value }: { value: string }) {
  const tone =
    value === "Cleared"
      ? "bg-emerald-50 text-emerald-700"
      : value === "Failed" || value === "Rejected"
        ? "bg-red-50 text-red-600"
        : value === "Interview scheduled"
          ? "bg-blue-50 text-blue-600"
          : "bg-amber-50 text-amber-700";
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-bold ${tone}`}
    >
      {value}
    </span>
  );
}
