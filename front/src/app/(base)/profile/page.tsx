"use client";
import { useContext } from "react";
import Card from "@/lib/components/ui/Card";
import Hero from "@/lib/components/ui/Hero";
import Center from "@/lib/components/layouts/Center";
import UserContext from "../../contexts/user";
import UserProfile from "@/lib/components/users/UserProfile";

export default function Page() {
  const user = useContext(UserContext);

  return (
    <>
      <Hero text="Profile" />
      <Center>
        <Card className="max-w-prose">
          <UserProfile user={user} />
        </Card>
      </Center>
    </>
  );
}
