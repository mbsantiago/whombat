"use client";
import Hero from "@/components/Hero";
import EvaluationSetList from "@/components/evaluation/EvaluationSetList";

export default function Page() {
  return (
    <>
      <Hero text="Evaluation Sets" />
      <EvaluationSetList />
    </>
  );
}
