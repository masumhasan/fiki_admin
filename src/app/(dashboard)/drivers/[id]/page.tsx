import { DriverDetailPage } from "@/components/drivers/driver-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DriverDetailPage driverId={id} />;
}
