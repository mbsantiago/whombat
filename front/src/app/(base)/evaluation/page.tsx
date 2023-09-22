"use client";
import Hero from "@/components/Hero";

import EvaluationSetList from "./components/EvaluationSetList";

export default function Page() {
  return (
    <>
      <Hero text="Evaluation Sets" />
      <EvaluationSetList />
    </>
  );
}
