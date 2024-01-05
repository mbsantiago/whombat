"use client";
import { useContext } from "react";
import Card from "@/components/Card";
import Hero from "@/components/Hero";
import Center from "@/components/layouts/Center";
import UserContext from "../context";
import UserProfile from "@/components/users/UserProfile";

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
