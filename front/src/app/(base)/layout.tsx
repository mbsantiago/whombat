"use client";
import toast from "react-hot-toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";

import queryClient from "@/app/client";
import useActiveUser from "@/hooks/api/useActiveUser";
import Notification from "@/components/Notification";
import Loading from "@/app/loading";
import { WhombatIcon } from "@/components/icons";

import { UserContext } from "./context";
import { NavBar, SideMenu } from "./components";

function WithLogIn({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const currentPath = `${pathname}${params ? `?${params}` : ""}`;

  const {
    data: user,
    isLoading,
    isError,
    update,
    logout,
    remove,
  } = useActiveUser({
    onLogout: () => {
      toast.success("You have been logged out");
      router.push(`/login?back=${encodeURIComponent(currentPath)}`);
    },
    onUnauthorized: () => {
      router.push(`/login?back=${encodeURIComponent(currentPath)}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div>
            <WhombatIcon width={128} height={128} className="h-32 w-32" />
          </div>
          <div>
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  if (!user || isError) {
    remove();
    router.push(`/login?back=${encodeURIComponent(currentPath)}`);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        update: update.mutate,
        logout: logout.mutate,
      }}
    >
      {children}
    </UserContext.Provider>
  );
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
          <Notification />
        </div>
      </WithLogIn>
    </QueryClientProvider>
  );
}
