"use client";
import EvaluationSetList from "@/components/evaluation/EvaluationSetList";
import Hero from "@/components/Hero";

export default function Page() {
  return (
    <>
      <Hero text="Evaluation Sets" />
      <EvaluationSetList />
    </>
  );
}
