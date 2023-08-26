"use client";
import { WhombatIcon } from "@/components/icons";
import { redirect } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "../client";
import useStore, { useHydration } from "@/store";
import { NavBar, SideMenu } from "./components";
import Loading from "@/app/loading";

function WithLogIn({ children }: { children: React.ReactNode }) {
  const isHydrated = useHydration();

  const user = useStore((state) => state.user);

  if (!isHydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div>
            <WhombatIcon className="h-32 w-32" />
          </div>
          <div>
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return redirect("/login");
  }

  return <>{children}</>;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WithLogIn>
        <div className="flex flex-row">
          <SideMenu />
          <main className="w-full">
            <NavBar />
            {children}
          </main>
        </div>
      </WithLogIn>
    </QueryClientProvider>
  );
}
