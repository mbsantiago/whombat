"use client";
import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto p-16">
      <h1 className="text-center text-6xl">
        Welcome to
        <br />
        <Image src="whombat.svg" alt="logo" width={64} height={64} className="m-2 inline" />
        <span className="font-sans font-bold text-emerald-500 underline decoration-8">
          Whombat
        </span>
      </h1>
      <h2 className="text-center text-3xl text-stone-500 dark:text-stone-500">
        Audio annotation tool with ML in mind!
      </h2>
    </div>
  );
}
