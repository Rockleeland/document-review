"use client";

import { ApprovedProvider } from "@/lib/approved-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ApprovedProvider>{children}</ApprovedProvider>;
}
