"use client";
import Image from "next/image";
import Card from "@/lib/components/ui/Card";
import Link from "@/lib/components/ui/Link";

export default function Page() {
  return (
    <div className="container mx-auto p-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-center text-7xl">
          <span className="text-6xl font-thin">Welcome to</span>
          <br />
          <Image
            src="/whombat.svg"
            alt="logo"
            width={100}
            height={100}
            className="m-2 inline"
          />
          <span className="font-sans font-bold text-emerald-500 underline decoration-8">
            Whombat
          </span>
        </h1>
        <h2 className="text-center text-3xl text-stone-500 dark:text-stone-500">
          Audio annotation tool with ML in mind!
        </h2>
      </div>
      <div className="pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-6 justify-between">
            <h2 className="text-2xl font-bold mb-4">
              Create and Manage Datasets
            </h2>
            <p className="text-sm mb-4">
              Register new datasets of audio recordings and manage their
              metadata.
            </p>
            <Link
              mode="text"
              href="/datasets/"
              className="text-sm underline font-bold"
            >
              Get Started
            </Link>
          </Card>
          <Card className="p-6 justify-between">
            <h2 className="text-2xl font-bold mb-4">Annotate Audio</h2>
            <p className="text-sm mb-4">
              Handle annotation projects, monitor progress, and export data.
            </p>
            <Link
              mode="text"
              href="/annotation_projects/"
              className="text-sm underline font-bold"
            >
              Start Annotating
            </Link>
          </Card>
          <Card className="p-6 justify-between">
            <h2 className="text-2xl font-bold mb-4">Evaluate your Models</h2>
            <p className="text-sm mb-4">
              Create evaluation sets, import model predictions, and test your
              aural skills on the evaluation sets.
            </p>
            <Link
              mode="text"
              href="/evaluation/"
              className="text-sm underline font-bold"
            >
              Explore Evaluations
            </Link>
          </Card>
          <Card className="p-6 justify-between">
            <h2 className="text-2xl font-bold mb-4">Explore the Data</h2>
            <p className="text-sm mb-4">
              Use our tools to explore annotated audio content across the entire
              database.
            </p>
            <Link
              mode="text"
              href="/exploration/"
              className="text-sm underline font-bold"
            >
              Start Exploring
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
