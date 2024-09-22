"use client";

import Link from "next/link";

import Button from "@/lib/components/ui/Button";
import Card from "@/lib/components/ui/Card";
import { H3 } from "@/lib/components/ui/Headings";

export default function Page() {
  return (
    <div className="container mx-auto flex flex-col p-16 gap-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-center text-5xl">Exploration Tools</h1>
        <h2 className="text-center text-3xl text-stone-500 dark:text-stone-500">
          Utilize the provided tools to delve into your data
        </h2>
      </div>
      <div className="flex flex-row gap-8 w-full justify-center">
        <Card className="text-center">
          <H3>Recordings</H3>
          <p className="text-stone-500">
            Explore the recordings, sort by metadata, discover recording
            locations on a map
          </p>
          <div className="w-full flex flex-row justify-center">
            <Link href="/exploration/recordings">
              <Button>Explore</Button>
            </Link>
          </div>
        </Card>
        <Card className="text-center">
          <H3>Clips</H3>
          <p className="text-stone-500">
            Discover annotated clips, view them in a gallery, and listen to them
          </p>
          <div className="w-full flex flex-row justify-center">
            <Link href="/exploration/clips">
              <Button>Explore</Button>
            </Link>
          </div>
        </Card>
        <Card className="text-center">
          <H3>Sound Events</H3>
          <p className="text-stone-500">
            Search and view annotated sound events. Visualize them in a
            scatterplot for easy reference or create a gallery for quick
            comparisons.
          </p>
          <div className="w-full flex flex-row justify-center">
            <Link href="/exploration/sound_events">
              <Button>Explore</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
