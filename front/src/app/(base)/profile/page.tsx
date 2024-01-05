"use client";
import { useRouter } from 'next/navigation'
import { useContext } from "react";
import Hero from "@/components/Hero";
import UserContext from '../context'
import UserProfile from "@/components/users/UserProfile";

export default function Page() {
  const router = useRouter()
  const user = useContext(UserContext)

  if (user == null) {
    router.push('/login')
  }

  return (
    <>
      <Hero text="Profile" />
      <div className="p-6">
        <UserProfile user={user} />
      </div>
    </>
  );
}
