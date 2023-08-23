export default function Hero({ text }: { text: string }) {
  return (
    <header className="bg-stone-50 shadow dark:bg-stone-800">
      <div className="max-w-7xl px-2 py-3 sm:px-3 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-200">
          {text}
        </h1>
      </div>
    </header>
  );
}
