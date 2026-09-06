"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Search,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  Car,
  Phone,
  Mail,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  getAdminUsersApi,
  updateAdminUserApi,
  deleteAdminUserApi,
  type AdminUserItem,
} from "@/lib/api";

type RoleFilter = "ALL" | "USER" | "DRIVER" | "ADMIN";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleFilter>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Role counts for summary cards
  const [counts, setCounts] = useState({
    total: 0,
    passengers: 0,
    drivers: 0,
    admins: 0,
  });

  // Notifications
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Edit State
  const [userToEdit, setUserToEdit] = useState<AdminUserItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "USER" as "USER" | "DRIVER" | "ADMIN",
    accountStatus: "ACTIVE",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete State
  const [userToDelete, setUserToDelete] = useState<AdminUserItem | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Current logged in admin ID to avoid self-deletion
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const token = window.localStorage.getItem("fiki_auth_token");
        if (token) {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          const payload = JSON.parse(jsonPayload);
          setCurrentAdminId(payload.id || payload._id || null);
        } else {
          const storedUser = window.localStorage.getItem("fiki_user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setCurrentAdminId(parsed.id || parsed._id || null);
          }
        }
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const fetchUsers = useCallback(
    async (isManualRefresh = false) => {
      if (typeof window === "undefined") return;
      const token = window.localStorage.getItem("fiki_auth_token");
      if (!token) {
        setLoading(false);
        return;
      }

      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await getAdminUsersApi(token, {
          search: query.trim() || undefined,
          role: selectedRole,
          page,
          limit: pageSize,
        });

        if (res.success && res.data) {
          setUsers(res.data.users || []);
          setTotalCount(res.data.total || 0);
          if (res.data.counts) {
            setCounts(res.data.counts);
          }
        } else {
          setErrorMsg(res.error?.message || "Failed to fetch users");
        }
      } catch {
        setErrorMsg("Failed to connect to server");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query, selectedRole, page, pageSize]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Open Edit Modal
  const handleOpenEdit = (user: AdminUserItem) => {
    setUserToEdit(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "USER",
      accountStatus: user.accountStatus || "ACTIVE",
    });
    setEditError("");
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    if (!editForm.name.trim()) {
      setEditError("Name is required");
      return;
    }
    if (!editForm.email.trim()) {
      setEditError("Email is required");
      return;
    }

    setSavingEdit(true);
    setEditError("");

    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setEditError("Authentication token not found.");
      setSavingEdit(false);
      return;
    }

    const res = await updateAdminUserApi(token, userToEdit._id, editForm);
    if (res.success) {
      setSuccessMsg(`User "${editForm.name}" updated successfully!`);
      setUserToEdit(null);
      await fetchUsers(true);
    } else {
      setEditError(res.error?.message || "Failed to update user.");
    }
    setSavingEdit(false);
  };

  // Open Delete Modal
  const handleOpenDelete = (user: AdminUserItem) => {
    setUserToDelete(user);
    setDeleteConfirmText("");
    setDeleteError("");
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    setDeleteError("");

    const token = window.localStorage.getItem("fiki_auth_token");
    if (!token) {
      setDeleteError("Authentication token not found.");
      setDeleting(false);
      return;
    }

    const res = await deleteAdminUserApi(token, userToDelete._id);
    if (res.success) {
      setSuccessMsg(
        `User "${userToDelete.name || userToDelete.email}" was permanently deleted.`
      );
      setUserToDelete(null);
      await fetchUsers(true);
    } else {
      setDeleteError(res.error?.message || "Failed to delete user.");
    }
    setDeleting(false);
  };

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  // Role Badge Helper
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "DRIVER":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Driver
          </span>
        );
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
            <span className="size-1.5 rounded-full bg-purple-500" />
            Admin
          </span>
        );
      case "USER":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
            <span className="size-1.5 rounded-full bg-sky-500" />
            Passenger
          </span>
        );
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    const isSuspended = status === "SUSPENDED";
    const isInactive = status === "INACTIVE";
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
          isSuspended
            ? "bg-rose-50 text-rose-700 border border-rose-200"
            : isInactive
            ? "bg-amber-50 text-amber-700 border border-amber-200"
            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
        }`}
      >
        <span
          className={`size-1.5 rounded-full ${
            isSuspended
              ? "bg-rose-500"
              : isInactive
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
        />
        {status ? status.charAt(0) + status.slice(1).toLowerCase() : "Active"}
      </span>
    );
  };

  // Avatar Initials Helper
  const getInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : "U";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Users Management"
        description="View and manage all registered drivers, passengers, and administrators."
        action={
          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={refreshing || loading}
            className="flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-xs font-bold text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw
              className={`size-3.5 ${refreshing ? "animate-spin text-primary" : ""}`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        }
      />

      {/* Success Notification */}
      {successMsg && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg("")}
            className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="rounded-lg p-1 text-rose-600 hover:bg-rose-100"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Summary Stats Cards */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Users
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="size-4.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">
            {loading ? "…" : counts.total}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            All registered accounts
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Passengers
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <UserCheck className="size-4.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-sky-600">
            {loading ? "…" : counts.passengers}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Rider accounts in system
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Drivers
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Car className="size-4.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {loading ? "…" : counts.drivers}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Registered driver accounts
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_6px_22px_rgba(8,37,82,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Admins
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <ShieldAlert className="size-4.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-purple-600">
            {loading ? "…" : counts.admins}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            System administrators
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            className="h-10 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-xs font-medium outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm"
            placeholder="Search by name, email, or phone..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-sm">
          {[
            { label: "All", value: "ALL" as RoleFilter, count: counts.total },
            {
              label: "Passengers",
              value: "USER" as RoleFilter,
              count: counts.passengers,
            },
            {
              label: "Drivers",
              value: "DRIVER" as RoleFilter,
              count: counts.drivers,
            },
            {
              label: "Admins",
              value: "ADMIN" as RoleFilter,
              count: counts.admins,
            },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setSelectedRole(tab.value);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                selectedRole === tab.value
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                  selectedRole === tab.value
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="rounded-2xl border border-border bg-card shadow-[0_6px_22px_rgba(8,37,82,0.06)] overflow-hidden">
        {loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs font-semibold text-muted-foreground">
              Loading registered users...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Users className="size-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                No users found
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {query || selectedRole !== "ALL"
                  ? "Try adjusting your search criteria or role filters."
                  : "No users have registered in the system yet."}
              </p>
            </div>
            {(query || selectedRole !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedRole("ALL");
                  setPage(1);
                }}
                className="mt-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table: hidden on screens < lg */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="w-12 px-4 py-3.5 text-center">SL</th>
                    <th className="px-4 py-3.5">User Name</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Phone Number</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Registered</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {users.map((user, index) => {
                    const isSelf = currentAdminId === user._id;
                    const serialNumber = (page - 1) * pageSize + index + 1;
                    return (
                      <tr
                        key={user._id}
                        className="transition hover:bg-muted/30"
                      >
                        <td className="px-4 py-3.5 text-center font-bold text-muted-foreground">
                          {serialNumber}
                        </td>

                        {/* Name & Avatar */}
                        <td className="px-4 py-3.5 font-bold text-foreground">
                          <div className="flex items-center gap-3">
                            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 font-bold text-primary shadow-xs border border-border/40">
                              {getInitials(user.name, user.email)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-bold text-foreground">
                                  {user.name || "—"}
                                </span>
                                {isSelf && (
                                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                ID: {user._id.slice(-6)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3.5 text-muted-foreground font-medium">
                          <span className="truncate">{user.email}</span>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3.5 font-medium text-foreground">
                          {user.phone ? (
                            <span>{user.phone}</span>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5">
                          {renderRoleBadge(user.role)}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          {renderStatusBadge(user.accountStatus)}
                        </td>

                        {/* Registered Date */}
                        <td className="px-4 py-3.5 text-muted-foreground font-medium">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  timeZone: "America/Chicago",
                                }
                              )
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(user)}
                              title="Edit user details"
                              className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary cursor-pointer"
                            >
                              <Pencil className="size-3.5" />
                              <span className="sr-only">Edit user</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDelete(user)}
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? "Cannot delete your own admin account"
                                  : "Permanently delete user"
                              }
                              className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                              <span className="sr-only">Delete user</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View: visible on screens < lg */}
            <div className="divide-y divide-border/60 lg:hidden">
              {users.map((user, index) => {
                const isSelf = currentAdminId === user._id;
                const serialNumber = (page - 1) * pageSize + index + 1;
                return (
                  <article key={user._id} className="p-4 space-y-3 sm:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 font-bold text-primary border border-border/40">
                          {getInitials(user.name, user.email)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-foreground">
                              {user.name || "—"}
                            </h4>
                            {isSelf && (
                              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            SL #{serialNumber} • ID: {user._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {renderRoleBadge(user.role)}
                        {renderStatusBadge(user.accountStatus)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 pt-1 text-xs sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="size-3.5 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="size-3.5 shrink-0 text-muted-foreground/70" />
                        <span>{user.phone || "No phone provided"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                        <Calendar className="size-3.5 shrink-0 text-muted-foreground/70" />
                        <span>
                          Joined:{" "}
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  timeZone: "America/Chicago",
                                }
                              )
                            : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(user)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                      >
                        <Pencil className="size-3.5 text-muted-foreground" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDelete(user)}
                        disabled={isSelf}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 text-xs font-bold text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Footer */}
            <footer className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Rows per page
                  <select
                    className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground outline-none focus:border-primary"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </label>
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <strong className="text-foreground">
                    {totalCount ? (page - 1) * pageSize + 1 : 0}–
                    {Math.min(page * pageSize, totalCount)}
                  </strong>{" "}
                  of {totalCount} users
                </p>
              </div>

              <nav
                aria-label="Pagination"
                className="flex items-center gap-1.5"
              >
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={page === 1}
                  onClick={() => setPage((v) => Math.max(1, v - 1))}
                  className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {pageCount <= 7 ? (
                  Array.from({ length: pageCount }, (_, i) => i + 1).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPage(v)}
                      className={`grid size-9 place-items-center rounded-lg text-xs font-bold transition cursor-pointer ${
                        page === v
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "border border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {v}
                    </button>
                  ))
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setPage(1)}
                      className={`grid size-9 place-items-center rounded-lg text-xs font-bold transition cursor-pointer ${
                        page === 1
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      1
                    </button>
                    {page > 3 && (
                      <span className="px-1 text-xs text-muted-foreground">
                        …
                      </span>
                    )}
                    {page > 2 && page < pageCount && (
                      <button
                        type="button"
                        onClick={() => setPage(page)}
                        className="grid size-9 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground cursor-pointer"
                      >
                        {page}
                      </button>
                    )}
                    {page < pageCount - 2 && (
                      <span className="px-1 text-xs text-muted-foreground">
                        …
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setPage(pageCount)}
                      className={`grid size-9 place-items-center rounded-lg text-xs font-bold transition cursor-pointer ${
                        page === pageCount
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {pageCount}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={page >= pageCount}
                  onClick={() => setPage((v) => Math.min(pageCount, v + 1))}
                  className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>
              </nav>
            </footer>
          </>
        )}
      </section>

      {/* Edit User Modal */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Pencil className="size-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  Edit User Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUserToEdit(null)}
                className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              {editError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  {editError}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  placeholder="name@example.com"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder="+1 (800) 000-0000"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* Role and Account Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    User Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        role: e.target.value as "USER" | "DRIVER" | "ADMIN",
                      })
                    }
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="USER">Passenger</option>
                    <option value="DRIVER">Driver</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Account Status
                  </label>
                  <select
                    value={editForm.accountStatus}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        accountStatus: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setUserToEdit(null)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {savingEdit ? (
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

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2 text-destructive">
                <Trash2 className="size-5" />
                <h3 className="text-base font-bold text-foreground">
                  Permanently Delete User
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <p className="text-xs leading-5 text-muted-foreground">
                Are you sure you want to permanently delete{" "}
                <strong className="text-foreground">
                  {userToDelete.name || "this user"}
                </strong>{" "}
                (<span className="font-medium text-foreground">{userToDelete.email}</span>)?
              </p>

              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Permanent Action Warning</span>
                </div>
                <p className="leading-5">
                  This action is <strong>permanent</strong> and cannot be undone. All associated profile data will be permanently removed from the database.
                </p>
              </div>

              {deleteError && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  {deleteError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Type <strong className="underline text-destructive">DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-semibold uppercase tracking-wider outline-none focus:border-destructive focus:ring-2 focus:ring-destructive/10"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  deleteConfirmText.trim().toUpperCase() !== "DELETE" || deleting
                }
                onClick={handleConfirmDelete}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-destructive px-5 text-xs font-bold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Permanently Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
