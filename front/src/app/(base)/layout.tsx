"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useContext, useCallback } from "react";
import toast from "react-hot-toast";

import Loading from "@/app/loading";
import { WhombatIcon } from "@/components/icons";
import { NavBar } from "@/components/navigation/NavBar";
import { SideMenu } from "@/components/navigation/SideMenu";
import useActiveUser from "@/lib/hooks/api/useActiveUser";

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

  if (isError) {
    router.push(`/login?back=${encodeURIComponent(currentPath)}`);
    return;
  }

  if (user == null) {
    throw Error("User is null");
  }

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

function Contents({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useContext(UserContext);

  const handleLogout = useCallback(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="flex flex-row w-full max-w-full h-full">
      <SideMenu user={user} onLogout={handleLogout} />
      <main className="w-full max-w-full h-full overflow-x-clip">
        <NavBar user={user} onLogout={handleLogout} />
        {children}
      </main>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <WithLogIn>
      <Contents>{children}</Contents>
    </WithLogIn>
  );
}
