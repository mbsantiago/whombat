function HorizontalDivider() {
  return <hr className="h-px mx-1 border-t-0 bg-stone-400 dark:bg-stone-600" />;
}

function VerticalDivider() {
  return (
    <div className="inline-block h-[250px] min-h-[1em] w-px self-stretch bg-stone-500"></div>
  );
}

export { HorizontalDivider, VerticalDivider };
