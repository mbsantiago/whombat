/*
 * StackedList component renders a list of React elements with keys.
 */
export default function StackedList<T>({
  items,
  children,
}: {
  items: T[];
  children: (item: T) => JSX.Element;
}) {
  return (
    <ul
      role="list"
      className="w-full divide-y divide-stone-300 dark:divide-stone-700"
    >
      {items.map((item, index) => (
        <li className="flex gap-x-6 justify-between py-5 w-full" key={index}>
          {children(item)}
        </li>
      ))}
    </ul>
  );
}
