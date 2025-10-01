"use client";

import dynamic from "next/dynamic";

const ClientPageWrapper = dynamic(
  () => import("@/components/ClientPageWrapper"),
  { ssr: false }
);

export default function ClientHomeContent() {
  return <ClientPageWrapper />;
}
