import { redirect } from "next/navigation";

export default function Page() {
  redirect("/ride-requests?tab=manual");
}
