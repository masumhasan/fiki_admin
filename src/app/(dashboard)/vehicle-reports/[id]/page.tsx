import { ShiftReportPage } from "@/components/vehicle-reports/shift-report-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ShiftReportPage reportId={id} />;
}
