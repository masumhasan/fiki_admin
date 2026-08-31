"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/drivers?tab=reports");
  }, [router]);

  return <div className="p-4 text-sm text-muted-foreground">Redirecting to Shift Reports...</div>;
}
