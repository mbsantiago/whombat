"use client";
import { redirect } from "next/navigation";
import { QueryClientProvider } from "react-query";
import queryClient from "../client";
import useStore, { useHydration } from "@/store";
import { NavBar, SideMenu } from "./components";

function WithLogIn({ children }: { children: React.ReactNode }) {
  const isHydrated = useHydration();
  const user = useStore((state) => state.user);
  if (!isHydrated) {
    return "Loading...";
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
