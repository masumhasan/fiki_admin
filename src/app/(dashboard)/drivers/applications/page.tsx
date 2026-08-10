import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { ApplicationsTable } from "@/components/drivers/drivers-page";

export default function DriverApplicationsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Driver Applications"
        description="Review and progress candidates through onboarding."
        action={
          <Link
            className="flex h-9 items-center rounded-lg border border-border bg-white px-4 text-xs font-bold text-primary hover:bg-muted"
            href="/drivers"
          >
            Back to drivers
          </Link>
        }
      />
      <ApplicationsTable />
    </div>
  );
}
