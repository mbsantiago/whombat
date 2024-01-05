"use client";
import Hero from "@/components/Hero";
import { WhombatIcon } from "@/components/icons";

export default function Page() {
  return (
    <div>
      <Hero text="About Whombat" />
      <div className="p-6 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center p-4">
          <WhombatIcon width={128} height={128} />
          <span className="font-sans font-bold text-emerald-500 underline decoration-8 text-6xl">
            Whombat
          </span>
        </div>
        <div className="max-w-prose text-center flex flex-col gap-2 text-lg">
          <p>
            Welcome to Whombat, an open-source web application for audio
            annotation and machine learning. At Whombat, we believe that
            effective annotation is at the heart of a successful machine
            learning process. Our platform not only facilitates seamless audio
            annotation but also offers robust project management capabilities,
            integrating annotation projects seamlessly into machine learning
            pipelines.
          </p>
          <p>
            Whombat is the result of collaborative efforts, developed with the
            support and collaboration of University College London and the
            Mexican National Council for the Humanities, Science, and Technology
            (CONAHCYT). We are committed to providing a powerful and
            user-friendly tool to enhance your audio annotation and machine
            learning endeavors.
          </p>
        </div>
      </div>
    </div>
  );
}
