"use client";
import TagSearchBar from "@/components/TagSearchBar";

export default function DatasetHome() {
  return (
    <div>
      Dataset Home
      <TagSearchBar onSelect={(tag) => console.log(tag)} />
    </div>
  );
}
