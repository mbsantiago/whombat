import {
  type Datum,
  type Layout,
  type PlotData,
  type PlotMouseEvent,
} from "plotly.js";
import { useCallback, useMemo } from "react";

import useTheme from "@/lib/hooks/useTheme";

import type { ScatterPlotData } from "@/lib/types";

type GroupKey = string;

type Grouper = (annotation: ScatterPlotData) => GroupKey | null;

const defaultGrouper = () => "annotation";

const getFeatureValue = (annotation: ScatterPlotData, name: string) => {
  const feature = annotation.features?.find((f) => f.name === name);
  return feature?.value ?? null;
};

function newTrace(
  key: GroupKey,
  xLabel: string,
  yLabel: string,
  zLabel: string,
): Partial<PlotData> {
  return {
    x: [],
    y: [],
    z: [],
    customdata: [],
    hovertemplate:
      `<b>${xLabel}</b>: %{x}<br>` +
      `<b>${yLabel}</b>: %{y}<br>` +
      `<b>${zLabel}</b>: %{z}`,
    type: "scatter3d",
    mode: "markers",
    name: key,
    marker: {
      size: 2,
      opacity: 0.5,
    },
  };
}

export interface UseScatterPlotProps {
  width?: number;
  height?: number;
  data: ScatterPlotData[];
  groupBy?: Grouper;
  xFeature?: string;
  yFeature?: string;
  zFeature?: string;
  onClick?: (annotation: ScatterPlotData) => void;
}

export default function useScatterPlot({
  data: initialData = [],
  groupBy = defaultGrouper,
  xFeature = "duration",
  yFeature = "high_freq",
  zFeature = "low_freq",
  onClick: onSoundEventAnnotationClick,
}: UseScatterPlotProps) {
  const data = useMemo<Partial<PlotData>[]>(() => {
    const traces: { [key: string]: Partial<PlotData> } = {};

    initialData.forEach((annotation) => {
      const groupKey = groupBy(annotation);

      if (groupKey == null) return;

      if (!(groupKey in traces)) {
        traces[groupKey] = newTrace(groupKey, xFeature, yFeature, zFeature);
      }

      const x = getFeatureValue(annotation, xFeature);
      const y = getFeatureValue(annotation, yFeature);
      const z = getFeatureValue(annotation, zFeature);

      if (x == null || y == null || z == null) return;
      (traces[groupKey].x as number[]).push(x);
      (traces[groupKey].y as number[]).push(y);
      (traces[groupKey].z as number[]).push(z);

      traces[groupKey].customdata?.push(
        annotation as unknown as Datum & Datum[],
      );
    });

    return Object.values(traces);
  }, [initialData, groupBy, xFeature, yFeature, zFeature]);

  const isDark = useTheme();

  const layout = useMemo<Partial<Layout>>(
    () => ({
      autosize: true,
      margin: { l: 0, r: 0, b: 0, t: 0 },
      paper_bgcolor: isDark ? "#0c0a09" : "#f5f5f4",
      font: {
        color: isDark ? "#d6d3d1" : "#44403c",
      },
      line: {
        color: isDark ? "#d6d3d1" : "#44403c",
      },
      legend: {
        yanchor: "bottom",
        xanchor: "right",
        y: 0.01,
        x: 0.99,
      },
      scene: {
        xaxis: { title: { text: xFeature } },
        yaxis: { title: { text: yFeature } },
        zaxis: { title: { text: zFeature } },
      },
    }),
    [xFeature, yFeature, zFeature, isDark],
  );

  const onClick = useCallback(
    (datum: Readonly<PlotMouseEvent>) => {
      const annotation = datum.points[0].customdata;
      onSoundEventAnnotationClick?.(annotation as unknown as ScatterPlotData);
    },
    [onSoundEventAnnotationClick],
  );

  return {
    data,
    layout,
    onClick,
  };
}
