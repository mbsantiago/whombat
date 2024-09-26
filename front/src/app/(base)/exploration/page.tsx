"use client";

import { useRouter } from "next/navigation";

import ExplorationCard from "@/lib/components/exploration/ExplorationCard";
import SectionLandingLayout from "@/lib/components/layouts/SectionLanding";

export default function Page() {
  const router = useRouter();
  return (
    <SectionLandingLayout
      Header={
        <>
          <h1 className="text-5xl text-center">Exploration Tools</h1>
          <h2 className="text-3xl text-center text-stone-500 dark:text-stone-500">
            Utilize the provided tools to delve into your data
          </h2>
        </>
      }
      Cards={
        <>
          <ExplorationCard
            title="Recordings"
            description="Explore the recordings, sort by metadata, discover recording locations on a map"
            onClick={() => router.push("/exploration/recordings/list/")}
          />
          <ExplorationCard
            title="Clips"
            description="Discover annotated clips, view them in a gallery, and listen to them"
            onClick={() => router.push("/exploration/clips/gallery/")}
          />
          <ExplorationCard
            title="Sound Events"
            description="Search and view annotated sound events. Visualize them in a scatterplot for easy reference or create a gallery for quick comparisons."
            onClick={() => router.push("/exploration/sound_events/gallery/")}
          />
        </>
      }
    />
  );
}
