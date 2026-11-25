"use client";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { ReactNode } from "react";
import toast from "react-hot-toast";

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => toast.dismiss("session-expired"),
    onError: (error) => {
      if (
        !isAxiosError(error) ||
        error.response?.status !== 401 ||
        window.location.pathname === "/login"
      ) {
        return;
      }
      toast.error(
        <span>
          Session expired.{" "}
          <a href="/login" target="_blank" rel="noopener noreferrer">
            Sign in in a new tab
          </a>
          , then retry here.
        </span>,
        { id: "session-expired", duration: Infinity },
      );
    },
  }),
});

export function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
