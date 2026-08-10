import { DriverApplicationPage } from "@/components/drivers/driver-application-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DriverApplicationPage applicationId={id} />;
}
