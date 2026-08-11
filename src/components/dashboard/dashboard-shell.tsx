"use client";

import {
  BarChart3,
  Bell,
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
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { clearMockSession } from "@/lib/mock-auth";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Ride Requests", href: "/ride-requests", icon: ClipboardList },
  { label: "Trips", href: "/trips", icon: Send },
  { label: "Drivers", href: "/drivers", icon: UsersRound },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Vehicle Report", href: "/vehicle-reports", icon: ClipboardList },
  { label: "Vehicles", href: "/vehicles", icon: CarFront },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const currentPage = navigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
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
                    Ride Requests
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
                    Ride Requests
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
                    href="/vehicle-reports"
                  >
                    Vehicle reports
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
                    href={isTripDetail ? "/trips" : "/drivers"}
                  >
                    {isTripDetail ? "Trips" : "Drivers"}
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
            <button
              aria-label="Notifications"
              className="relative flex size-10 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-muted transition hover:bg-slate-50 hover:text-brand-navy"
              type="button"
            >
              <Bell className="size-4.75" />
              <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-[#f59e0b]" />
            </button>
            <button
              className="flex items-center gap-2.5 rounded-xl p-1.5 text-left hover:bg-slate-50"
              type="button"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-brand-navy text-[10px] font-bold text-white">
                AK
              </span>
              <span className="hidden sm:block">
                <span className="block text-sm font-bold leading-4">
                  Admin Karim
                </span>
                <span className="hidden text-[11px] text-brand-muted">
                  Admin
                </span>
              </span>
              <ChevronDown className="hidden size-4 text-brand-muted sm:block" />
            </button>
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
              pathname === item.href || pathname.startsWith(`${item.href}/`);
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
      <div className="border-t border-primary-foreground/10 p-4">
        <div className="mb-4 flex items-center gap-3 px-1">
          <span className="grid size-8 place-items-center rounded-full bg-white/10 text-[10px] font-bold">
            AK
          </span>
          <div>
            <p className="text-xs font-bold">Admin Karim</p>
            <p className="text-[10px] text-white/50">Fleet Manager</p>
          </div>
        </div>
        <button
          className="flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-red-300 transition hover:bg-destructive/14"
          onClick={signOut}
          type="button"
        >
          <LogOut className="size-4.5" /> Sign out
        </button>
      </div>
    </>
  );
}
