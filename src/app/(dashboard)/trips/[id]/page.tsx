import { TripDetailPage } from "@/components/trips/trip-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TripDetailPage tripId={id} />;
}
