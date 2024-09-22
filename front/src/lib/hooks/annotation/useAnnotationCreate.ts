import useCreateBBox from "@/lib/hooks/draw/useCreateBBox";
import useCreateInterval from "@/lib/hooks/draw/useCreateInterval";
import useCreateLineString from "@/lib/hooks/draw/useCreateLineString";
import useCreateTimeStamp from "@/lib/hooks/draw/useCreateTimeStamp";

import type {
  Dimensions,
  Geometry,
  GeometryType,
  SpectrogramWindow,
} from "@/lib/types";

const PRIMARY = "rgb(16 185 129)";
const CREATE_STYLE = {
  borderColor: PRIMARY,
  fillColor: PRIMARY,
  borderWidth: 2,
  borderDash: [5, 5],
  fillAlpha: 0.2,
};

export default function useAnnotationCreate({
  viewport,
  dimensions,
  enabled = true,
  geometryType = "TimeStamp",
  onCreate,
}: {
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  enabled?: boolean;
  geometryType: GeometryType;
  onCreate: (geometry: Geometry) => void;
}) {
  const { props: propsBBox, draw: drawBBox } = useCreateBBox({
    viewport,
    dimensions,
    onCreate,
    style: CREATE_STYLE,
    enabled: enabled && geometryType === "BoundingBox",
  });

  const { props: propsInterval, draw: drawInterval } = useCreateInterval({
    viewport,
    dimensions,
    onCreate,
    style: CREATE_STYLE,
    enabled: enabled && geometryType === "TimeInterval",
  });

  const { props: propsTimeStamp, draw: drawTimeStamp } = useCreateTimeStamp({
    viewport,
    dimensions,
    onCreate,
    style: CREATE_STYLE,
    enabled: enabled && geometryType === "TimeStamp",
  });

  const { props: propsLineString, draw: drawLineString } = useCreateLineString({
    viewport,
    dimensions,
    onCreate,
    style: CREATE_STYLE,
    enabled: enabled && geometryType === "LineString",
  });

  if (!enabled) {
    return {
      props: {},
      draw: _VOID_FN,
    };
  }

  switch (geometryType) {
    case "BoundingBox":
      return { props: propsBBox, draw: drawBBox };
    case "TimeInterval":
      return { props: propsInterval, draw: drawInterval };
    case "TimeStamp":
      return { props: propsTimeStamp, draw: drawTimeStamp };
    case "LineString":
      return { props: propsLineString, draw: drawLineString };
    default:
      throw new Error(`Invalid geometry type: ${geometryType}`);
  }
}

const _VOID_FN = () => {};
