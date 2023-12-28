"use client";
import Link from "next/link";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { H3 } from "@/components/Headings";

export default function Page() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <Card>Statistics</Card>
      <div className="flex flex-row gap-8 w-full justify-center">
        <Card className="text-center">
          <H3>Recordings</H3>
          <p className="text-stone-500">
            Explore the recordings, sort by metadata, discover recording
            locations on a map, and check out basic statistics
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
