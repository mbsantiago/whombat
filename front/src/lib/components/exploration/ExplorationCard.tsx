import * as ui from "@/lib/components/ui";

export default function ExplorationCard(props: {
  title: string;
  description: string;
  button?: string;
  onClick?: () => void;
}) {
  return (
    <ui.Card className="text-center w-96">
      <ui.H3>{props.title}</ui.H3>
      <p className="text-stone-500 grow">{props.description}</p>
      <div className="flex flex-row justify-center w-full">
        <ui.Button mode="text" variant="primary" onClick={props.onClick}>
          {props.button || "Explore"}
        </ui.Button>
      </div>
    </ui.Card>
  );
}
