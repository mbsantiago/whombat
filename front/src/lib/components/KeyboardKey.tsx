export default function KeyboardKey({ code }: { code: string }) {
  return (
    <span className="inline-block px-1 font-mono bg-stone-900 border-stone-800 border rounded text-stone-300 text-xs">
      {code}
    </span>
  );
}
