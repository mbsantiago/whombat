export default function ListCounts(props: {
  startIndex: number;
  endIndex: number;
  total: number;
}) {
  return (
    <div>
      <span className="text-stone-500">
        Showing{" "}
        <span className="font-bold">
          {props.startIndex} - {props.endIndex}
        </span>{" "}
        out of{" "}
        <span className="font-bold text-emerald-500">{props.total}</span>{" "}
      </span>
    </div>
  );
}
