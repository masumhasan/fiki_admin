"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { RideRequestsPage } from "@/components/ride-requests/ride-requests-page";
import ManualRideRequestsPage from "@/components/manual-ride-requests/manual-ride-requests-page";
import { TripsPage } from "@/components/trips/trips-page";

function RidesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "requests";

  const handleTabChange = (tab: string) => {
    router.push(`/ride-requests?tab=${tab}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rides"
        description="Review, approve and manage passenger ride requests, manual requests, and trips."
      />

      <div className="flex border-b border-border">
        <button
          onClick={() => handleTabChange("requests")}
          className={`relative px-5 py-3 text-sm font-bold transition-colors cursor-pointer ${
            currentTab === "requests"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          type="button"
        >
          Ride Requests
          {currentTab === "requests" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("manual")}
          className={`relative px-5 py-3 text-sm font-bold transition-colors cursor-pointer ${
            currentTab === "manual"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          type="button"
        >
          Manual Ride Requests
          {currentTab === "manual" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("trips")}
          className={`relative px-5 py-3 text-sm font-bold transition-colors cursor-pointer ${
            currentTab === "trips"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          type="button"
        >
          Trips
          {currentTab === "trips" && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <div>
        {currentTab === "requests" && <RideRequestsPage hideHeader />}
        {currentTab === "manual" && <ManualRideRequestsPage hideHeader />}
        {currentTab === "trips" && <TripsPage hideHeader />}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading rides...</div>}>
      <RidesPageContent />
    </Suspense>
  );
}
