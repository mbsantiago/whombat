export function HorizontalDivider() {
  return <hr className="mx-1 h-px border-t-0 bg-stone-400 dark:bg-stone-600" />;
}

export function VerticalDivider() {
  return (
    <div className="inline-block self-stretch w-px h-[250px] min-h-[1em] bg-stone-500"></div>
  );
}
