import { version } from "@/app/version";

function WhombatVersion() {
  return <div className="text-stone-500">whombat version: {version}</div>;
}

export function Footer() {
  return (
    <nav className="mt-auto">
      <div className="flex z-50 flex-wrap justify-between items-center p-4">
        <WhombatVersion />
      </div>
    </nav>
  );
}
