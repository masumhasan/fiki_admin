"use client";

import {
  BarChart3,
  CalendarDays,
  CarFront,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Send,
  UsersRound,
  X,
  Phone,
  PlusCircle,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { clearMockSession } from "@/lib/mock-auth";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Rides", href: "/ride-requests", icon: ClipboardList },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "Drivers", href: "/drivers", icon: UsersRound },
  { label: "Vehicles", href: "/vehicles", icon: CarFront },
  {
    label: "Payroll",
    href: "/earning-management",
    icon: DollarSign,
  },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  {
    href: "/crm",
    icon: Phone,
    label: "CRM",
  },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const currentPage = navigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.href === "/drivers" && pathname.startsWith("/vehicle-reports")),
  );
  const isTripDetail = /^\/trips\/[^/]+$/.test(pathname);
  const isDriverDetail = /^\/drivers\/[^/]+$/.test(pathname);
  const isDriverApplication = /^\/drivers\/applications\/[^/]+$/.test(pathname);
  const isVehicleReportDetail = /^\/vehicle-reports\/[^/]+$/.test(pathname);
  const isRideRequestDetail = /^\/ride-requests\/[^/]+$/.test(pathname);
  const isQuotation = /^\/ride-requests\/[^/]+\/quotation$/.test(pathname);
  const isDriverApplications = pathname === "/drivers/applications";
  const rideRequestId = pathname.split("/")[2];
  const driverApplicationId = pathname.split("/")[3];

  function handleSignOut() {
    clearMockSession();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("fiki_auth_token");
      window.localStorage.removeItem("fiki_user");
    }
    router.replace("/login");
  }

  return (
    <div className="min-h-dvh bg-[#f5f7fb] text-brand-navy">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-58.75 bg-primary text-primary-foreground lg:flex lg:flex-col">
        <Sidebar pathname={pathname} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 cursor-default bg-brand-navy/35 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            type="button"
          />
          <aside className="relative flex h-full w-[min(19rem,88vw)] flex-col bg-primary text-primary-foreground shadow-2xl">
            <button
              aria-label="Close menu"
              className="absolute right-3 top-4 flex size-9 items-center justify-center rounded-lg text-primary-foreground/65 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setMobileOpen(false)}
              type="button"
            >
              <X className="size-5" />
            </button>
            <Sidebar
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-58.75">
        <header className="sticky top-0 z-30 flex h-15.5 items-center border-b border-[#e7ebf1] bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-6">
          <button
            aria-label="Open navigation"
            className="mr-3 flex size-10 items-center justify-center rounded-xl border border-brand-border text-brand-navy lg:hidden"
            onClick={() => setMobileOpen(true)}
            type="button"
          >
            <Menu className="size-5" />
          </button>
          {pathname === "/dashboard" ? (
            <nav
              className="flex items-center gap-2 text-sm"
              aria-label="Breadcrumb"
            >
              <span className="text-brand-muted">Dashboard</span>
              <span className="text-brand-soft">›</span>
              <strong className="text-[#20283a]">Overview</strong>
            </nav>
          ) : (
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-2 text-sm"
            >
              <Link
                className="hidden font-medium text-brand-muted transition hover:text-primary sm:block"
                href="/dashboard"
              >
                Dashboard
              </Link>
              <span className="hidden text-brand-soft sm:block">/</span>
              {isDriverApplications ? (
                <>
                  <Link
                    className="hidden font-medium text-brand-muted transition hover:text-primary sm:block"
                    href="/drivers"
                  >
                    Drivers
                  </Link>
                  <span className="hidden text-brand-soft sm:block">/</span>
                  <span className="truncate font-bold text-primary">
                    Driver Applications
                  </span>
                </>
              ) : isQuotation ? (
                <>
                  <Link
                    className="hidden font-medium text-brand-muted transition hover:text-primary sm:block"
                    href="/ride-requests"
                  >
                    Rides
                  </Link>
                  <span className="hidden text-brand-soft sm:block">/</span>
                  <Link
                    className="hidden font-medium text-brand-muted transition hover:text-primary sm:block"
                    href={pathname.replace("/quotation", "")}
                  >
                    {rideRequestId}
                  </Link>
                  <span className="hidden text-brand-soft sm:block">/</span>
                  <span className="truncate font-bold text-primary">
                    Create Quotation
                  </span>
                </>
              ) : isRideRequestDetail ? (
                <>
                  <Link
                    className="hidden font-medium text-brand-muted transition hover:text-primary sm:block"
                    href="/ride-requests"
                  >
                    Rides
                  </Link>
                  <span className="hidden text-brand-soft sm:block">/</span>
                  <span className="truncate font-bold text-primary">
                    {rideRequestId}
                  </span>
                </>
              ) : isVehicleReportDetail ? (
                <>
                  <Link
                    className="hidden font-medium text-brand-muted transition hover:text-primary sm:block"
                    href="/drivers?tab=reports"
                  >
                    Shift reports
                  </Link>
                  <span className="hidden text-brand-soft sm:block">/</span>
                  <span className="truncate font-bold text-primary">
                    Shift details
                  </span>
                </>
              ) : isDriverApplication ? (
                <>
                  <Link
                    className="hidden font-medium text-brand-muted transition hover:text-primary sm:block"
                    href="/drivers"
                  >
                    Drivers
                  </Link>
                  <span className="hidden text-brand-soft sm:block">/</span>
                  <Link
                    className="hidden font-medium text-brand-muted transition hover:text-primary sm:block"
                    href="/drivers/applications"
                  >
                    Driver Applications
                  </Link>
                  <span className="hidden text-brand-soft sm:block">/</span>
                  <span className="hidden font-medium text-brand-muted sm:block">
                    {driverApplicationId}
                  </span>
                  <span className="hidden text-brand-soft sm:block">/</span>
                  <span className="truncate font-bold text-primary">
                    Application details
                  </span>
                </>
              ) : isTripDetail || isDriverDetail ? (
                <>
                  <Link
                    className="hidden font-medium text-brand-muted transition hover:text-primary sm:block"
                    href={
                      isTripDetail ? "/ride-requests?tab=trips" : "/drivers"
                    }
                  >
                    {isTripDetail ? "Rides" : "Drivers"}
                  </Link>
                  <span className="hidden text-brand-soft sm:block">/</span>
                  <span className="truncate font-bold text-primary">
                    {isTripDetail ? "Trip detail" : "Driver detail"}
                  </span>
                </>
              ) : (
                <span className="truncate font-bold text-primary">
                  {currentPage?.label ?? "Admin portal"}
                </span>
              )}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-slate-100/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                type="button"
              >
                <span className="flex size-8.5 items-center justify-center rounded-full bg-brand-navy text-[11px] font-bold text-white shadow-sm ring-2 ring-brand-navy/10">
                  AD
                </span>
                <span className="hidden sm:block">
                  <span className="block text-sm font-bold leading-4 text-foreground">
                    Admin
                  </span>
                </span>
                <ChevronDown
                  className={`hidden size-4 text-brand-muted sm:block transition-transform duration-200 ${
                    userDropdownOpen ? "rotate-180 text-foreground" : ""
                  }`}
                />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    aria-hidden="true"
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 w-52 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-[0_12px_32px_rgba(15,35,65,0.12)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                    <div className="border-b border-border/80 px-3 py-2.5">
                      <p className="text-xs font-bold text-foreground">
                        Admin Portal
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        admin@fikitransit.com
                      </p>
                    </div>
                    <div className="pt-1">
                      <button
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleSignOut();
                        }}
                        type="button"
                      >
                        <LogOut className="size-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className=" w-full p-4 sm:p-6 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  function signOut() {
    clearMockSession();
    router.replace("/login");
  }
  return (
    <>
      <div className="flex h-16.5 items-center border-b border-primary-foreground/10 px-4">
        <span className="mr-2.5 grid size-11 shrink-0 place-items-center rounded-xl bg-primary-foreground">
          <BrandMark className="size-9" />
        </span>
        <div>
          <div className="text-[14px] font-bold leading-none tracking-[0.03em] text-primary-foreground">
            FIKI
          </div>
          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
            Transit
          </p>
        </div>
      </div>
      <nav
        className="flex-1 overflow-y-auto px-2 py-6"
        aria-label="Primary navigation"
      >
        <div className="space-y-1.5">
          {navigation.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              (item.href === "/drivers" && pathname.startsWith("/vehicle-reports"));
            const Icon = item.icon;
            return (
              <Link
                className={`group flex h-11 items-center gap-3 rounded-xl px-2.5 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "bg-[#214777] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                    : "text-primary-foreground/65 hover:bg-black/15 hover:text-white"
                }`}
                href={item.href}
                key={item.href}
                onClick={onNavigate}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-200 ${active ? "bg-white/10 text-white" : "text-white/50 group-hover:text-white"}`}
                >
                  <Icon className="size-4.5" />
                </span>
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
