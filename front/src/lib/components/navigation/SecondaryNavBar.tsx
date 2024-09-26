export default function SecondaryNavBar({
  title,
  icon,
  buttons = [],
}: {
  title: string;
  icon?: JSX.Element;
  buttons?: JSX.Element[];
}) {
  return (
    <div className="flex flex-row justify-between items-center mb-3 space-x-4">
      <div>
        {icon}
        <span className="font-thin">{title}</span>
      </div>
      <ul className="flex flex-row space-x-3">
        {buttons.map((button, index) => (
          <li key={index}>{button}</li>
        ))}
      </ul>
    </div>
  );
}
