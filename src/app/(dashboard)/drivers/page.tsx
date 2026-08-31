"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { DriversPage } from "@/components/drivers/drivers-page";
import { VehicleReportsPage } from "@/components/vehicle-reports/vehicle-reports-page";

function DriversTabsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "drivers";

  const handleTabChange = (tab: string) => {
    router.push(`/drivers?tab=${tab}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drivers"
        description="Manage driver accounts and shift/vehicle reports."
        action={
          currentTab === "drivers" && (
            <Link
              className="flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-[#0d2c58]"
              href="/drivers/applications"
            >
              View new requests
            </Link>
          )
        }
      />

      <div className="flex border-b border-border">
        <button
          onClick={() => handleTabChange("drivers")}
          className={`relative px-5 py-3 text-sm font-bold transition-colors cursor-pointer ${
            currentTab === "drivers"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          type="button"
        >
          Drivers
          {currentTab === "drivers" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("reports")}
          className={`relative px-5 py-3 text-sm font-bold transition-colors cursor-pointer ${
            currentTab === "reports"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          type="button"
        >
          Shift Reports
          {currentTab === "reports" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <div>
        {currentTab === "drivers" && <DriversPage hideHeader />}
        {currentTab === "reports" && <VehicleReportsPage hideHeader />}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading drivers...</div>}>
      <DriversTabsContent />
    </Suspense>
  );
}
