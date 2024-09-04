"use client";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { WhombatIcon } from "@/components/icons";
import UserCreateForm from "@/components/users/UserCreateForm";
import Info from "@/components/Info";

import type { User } from "@/types";

export default function Page() {
  const router = useRouter();

  const handleCreate = useCallback(
    (user: Promise<User>) => {
      toast.promise(
        user.then((user) => {
          router.push("/login");
          return user;
        }),
        {
          loading: "Creating account...",
          success: "Account created!",
          error: "Failed to create account",
        },
      );
    },
    [router],
  );

  const handleAuthenticationError = useCallback(() => {
    toast.error("This is not your first time here, is it?");
    router.push("/login");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col max-w-prose gap-4">
        <div className="mb-4 flex flex-col items-center gap-4 text-center text-7xl">
          <WhombatIcon width={128} height={128} />
          <span className="font-sans font-bold text-emerald-500 underline decoration-8">
            Whombat
          </span>
        </div>
        <h1 className="text-3xl font-bold text-center">Welcome!</h1>
        <p className="max-w-prose text-center">
          Let&apos;s get started by creating your account. Provide your
          information and set up a secure password below.
        </p>
        <UserCreateForm
          onCreate={handleCreate}
          onAuthenticationError={handleAuthenticationError}
        />
        <Info>
          <p className="text-sm max-w-prose text-center">
            Your data is stored locally on your computer and is not sent to any
            server.
          </p>
        </Info>
      </div>
    </div>
  );
}
