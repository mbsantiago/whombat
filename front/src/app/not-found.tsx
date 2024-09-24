"use client";

import { useRouter } from "next/navigation";

import NotFoundBase from "@/lib/components/ui/NotFound";

export default function NotFound() {
  const router = useRouter();
  return <NotFoundBase onGoHome={() => router.push("/")} />;
}
