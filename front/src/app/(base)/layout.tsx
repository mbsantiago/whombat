"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  notFound,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { type ReactNode, useContext } from "react";
import toast from "react-hot-toast";

import queryClient from "@/app/client";
import Loading from "@/app/loading";
import { WhombatIcon } from "@/components/icons";
import { NavBar } from "@/components/navigation/NavBar";
import { SideMenu } from "@/components/navigation/SideMenu";
import Notification from "@/components/Notification";
import useActiveUser from "@/hooks/api/useActiveUser";

import UserContext from "./context";

function WithLogIn({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const currentPath = `${pathname}${params ? `?${params}` : ""}`;

  const {
    data: user,
    isLoading,
    isError,
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
      <div className="flex justify-center items-center w-screen h-screen">
        <div className="flex flex-col items-center">
          <div>
            <WhombatIcon width={128} height={128} className="w-32 h-32" />
          </div>
          <div>
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  if (user == null || isError) {
    router.push(`/login?back=${encodeURIComponent(currentPath)}`);
    return;
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

function Contents({ children }: { children: ReactNode }) {
  const user = useContext(UserContext);

  if (user == null) {
    notFound();
  }

  const { logout } = useActiveUser({ enabled: false });

  return (
    <div className="flex flex-row w-full max-w-full h-full">
      <SideMenu logout={logout.mutate} />
      <main className="w-full max-w-full h-full overflow-x-clip">
        <NavBar user={user} />
        {children}
      </main>
      <Notification />
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WithLogIn>
        <Contents>{children}</Contents>
      </WithLogIn>
    </QueryClientProvider>
  );
}
