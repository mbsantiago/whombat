export default function Gallery<T>({
  children,
  items,
}: {
  items: T[];
  children: (item: T) => JSX.Element;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item, index) => (
        <div key={index}>{children(item)}</div>
      ))}
    </div>
  );
}
