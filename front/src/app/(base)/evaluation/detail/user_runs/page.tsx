"use client";

import Empty from "@/lib/components/ui/Empty";

export default function Page() {
  return (
    <Empty>
      <h1 className="text-5xl font-thin text-stone-900 dark:text-stone-200 mb-4">
        Coming Soon
      </h1>
      <p className="text-lg text-stone-500 dark:text-stone-400 mb-2">
        Stay tuned!
      </p>
      <p className="text-stone-700 dark:text-stone-300">
        Soon, you will have the opportunity to test and enhance your sound
        identification skills on this evaluation set.
      </p>
    </Empty>
  );
}
