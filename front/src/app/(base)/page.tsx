"use client";

export default function Home() {
  return (
    <main>
      <div className="container mx-auto p-16">
        <h1 className="text-center text-6xl">
          Welcome to
          <br />
          <img src="whombat.svg" alt="logo" className="m-2 inline h-16" />
          <span className="font-sans font-bold text-emerald-500 underline decoration-8">
            Whombat
          </span>
        </h1>
        <h2 className="text-center text-3xl text-stone-500 dark:text-stone-500">
          Audio annotation tool with ML in mind!
        </h2>
      </div>
    </main>
  );
}
