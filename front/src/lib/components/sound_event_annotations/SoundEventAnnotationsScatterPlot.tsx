import Plot from "react-plotly.js";
import { useMount } from "react-use";

import useScatterPlot from "@/lib/hooks/useScatterPlot";

import type { ScatterPlotData } from "@/lib/types";

export default function AnnotationsScatterPlot(props: {
  data: ScatterPlotData[];
  onClickSoundEvent: (annotation: ScatterPlotData) => void;
  height?: number;
}) {
  useMount(() => {
    window.dispatchEvent(new Event("resize"));
  });

  const { data, layout, onClick } = useScatterPlot({
    data: props.data,
    onClick: props.onClickSoundEvent,
    groupBy: groupBySpecies,
  });

  return (
    <Plot
      className="overflow-hidden w-full h-96 rounded-lg"
      data={data}
      layout={layout}
      onClick={onClick}
      useResizeHandler={true}
      style={{ height: props.height || undefined }}
      config={{
        responsive: true,
      }}
    />
  );
}

function groupBySpecies(data: ScatterPlotData) {
  return (
    data.tags?.find((tag) => tag.key === "Scientific Taxon Name")?.value ||
    "unknown"
  );
}
