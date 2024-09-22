import createEditHook from "@/lib/hooks/draw/createEditHook";

import type { EditableElement } from "@/lib/draw/edit";
import type {
  BoundingBox,
  Dimensions,
  Geometry,
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Pixel,
  Point,
  Polygon,
  TimeInterval,
  TimeStamp,
} from "@/lib/types";
import { shiftGeometry, shiftPolygon } from "@/lib/utils/geometry";

export function getTimeStampEditableElements(
  geometry: TimeStamp,
  { height }: { height: number },
): EditableElement<TimeStamp>[] {
  const onset = geometry.coordinates;
  return [
    {
      id: "onset",
      type: "Edge",
      coords: [
        [onset, 0],
        [onset, height],
      ],
      drag: (current: TimeStamp, start: Pixel, end: Pixel) => {
        const dx = end.x - start.x;
        return {
          type: "TimeStamp",
          coordinates: current.coordinates + dx,
        };
      },
    },
  ];
}

export function getTimeIntervalEditableElements(
  geom: TimeInterval,
  {
    height,
  }: {
    height: number;
  },
): EditableElement<TimeInterval>[] {
  const [left, right] = geom.coordinates;
  return [
    {
      id: "left",
      type: "Edge",
      coords: [
        [left, 0],
        [left, height],
      ],
      drag: (current: TimeInterval, start: Pixel, end: Pixel) => {
        const dx = end.x - start.x;
        const [l, r] = current.coordinates;
        return {
          type: "TimeInterval",
          coordinates: [l + dx, r],
        };
      },
    },
    {
      id: "right",
      type: "Edge",
      coords: [
        [right, 0],
        [right, height],
      ],
      drag: (current: TimeInterval, start: Pixel, end: Pixel) => {
        const dx = end.x - start.x;
        const [l, r] = current.coordinates;
        return {
          type: "TimeInterval",
          coordinates: [l, r + dx],
        };
      },
    },
    {
      id: "area",
      type: "Area",
      coords: [
        [
          [left, height],
          [left, 0],
          [right, 0],
          [right, height],
        ],
      ],
      drag: (current: TimeInterval, start: Pixel, end: Pixel) => {
        const dx = end.x - start.x;
        const [l, r] = current.coordinates;
        return {
          type: "TimeInterval",
          coordinates: [l + dx, r + dx],
        };
      },
    },
  ];
}

export function getBBoxEditableElements(
  geometry: BoundingBox,
): EditableElement<BoundingBox>[] {
  const [left, top, right, bottom] = geometry.coordinates;
  return [
    {
      id: "top-left",
      type: "Keypoint",
      coords: [left, top],
      drag: (current: BoundingBox, start: Pixel, end: Pixel) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const [l, t, r, b] = current.coordinates;
        return {
          type: "BoundingBox",
          coordinates: [l + dx, t + dy, r, b],
        };
      },
    },
    {
      id: "bottom-left",
      type: "Keypoint",
      coords: [left, bottom],
      drag: (current: BoundingBox, start: Pixel, end: Pixel) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const [l, t, r, b] = current.coordinates;
        return {
          type: "BoundingBox",
          coordinates: [l + dx, t, r, b + dy],
        };
      },
    },
    {
      id: "bottom-right",
      type: "Keypoint",
      coords: [right, top],
      drag: (current: BoundingBox, start: Pixel, end: Pixel) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const [l, t, r, b] = current.coordinates;
        return {
          type: "BoundingBox",
          coordinates: [l, t + dy, r + dx, b],
        };
      },
    },
    {
      id: "top-right",
      type: "Keypoint",
      coords: [right, bottom],
      drag: (current: BoundingBox, start: Pixel, end: Pixel) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const [l, t, r, b] = current.coordinates;
        return {
          type: "BoundingBox",
          coordinates: [l, t, r + dx, b + dy],
        };
      },
    },
    {
      id: "left",
      type: "Edge",
      coords: [
        [left, top],
        [left, bottom],
      ],
      drag: (current: BoundingBox, start: Pixel, end: Pixel) => {
        const dx = end.x - start.x;
        const [l, t, r, b] = current.coordinates;
        return {
          type: "BoundingBox",
          coordinates: [l + dx, t, r, b],
        };
      },
    },
    {
      id: "bottom",
      type: "Edge",
      coords: [
        [left, bottom],
        [right, bottom],
      ],
      drag: (current: BoundingBox, start: Pixel, end: Pixel) => {
        const dy = end.y - start.y;
        const [l, t, r, b] = current.coordinates;
        return {
          type: "BoundingBox",
          coordinates: [l, t, r, b + dy],
        };
      },
    },
    {
      id: "right",
      type: "Edge",
      coords: [
        [right, bottom],
        [right, top],
      ],
      drag: (current: BoundingBox, start: Pixel, end: Pixel) => {
        const dx = end.x - start.x;
        const [l, t, r, b] = current.coordinates;
        return {
          type: "BoundingBox",
          coordinates: [l, t, r + dx, b],
        };
      },
    },
    {
      id: "top",
      type: "Edge",
      coords: [
        [right, top],
        [left, top],
      ],
      drag: (current: BoundingBox, start: Pixel, end: Pixel) => {
        const dy = end.y - start.y;
        const [l, t, r, b] = current.coordinates;
        return {
          type: "BoundingBox",
          coordinates: [l, t + dy, r, b],
        };
      },
    },
    {
      id: "area",
      type: "Area",
      coords: [
        [
          [left, top],
          [left, bottom],
          [right, bottom],
          [right, top],
        ],
      ],
      drag: (current: BoundingBox, start: Pixel, end: Pixel) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const [l, t, r, b] = current.coordinates;
        return {
          type: "BoundingBox",
          coordinates: [l + dx, t + dy, r + dx, b + dy],
        };
      },
    },
  ];
}

export function getPointEditableElements(
  geom: Point,
): EditableElement<Point>[] {
  return [
    {
      id: "point",
      type: "Keypoint",
      coords: geom.coordinates,
      drag: (current: Point, start: Pixel, end: Pixel) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const [x, y] = current.coordinates;
        return {
          type: "Point",
          coordinates: [x + dx, y + dy],
        };
      },
    },
  ];
}

export function getMultiPointEditableElements(
  geom: MultiPoint,
): EditableElement<MultiPoint>[] {
  return geom.coordinates.map((p, index) => {
    return {
      id: `point-${index}`,
      type: "Keypoint",
      coords: p,
      drag: (current: MultiPoint, start: Pixel, end: Pixel) => {
        const next = [...current.coordinates];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const [x, y] = current.coordinates[index];
        next[index] = [x + dx, y + dy];
        return {
          type: "MultiPoint",
          coordinates: next,
        };
      },
    };
  });
}

export function getLineStringEditableElements(
  linestring: LineString,
  close = false,
): EditableElement<LineString>[] {
  const { length } = linestring.coordinates;

  const vertices: EditableElement<LineString>[] = linestring.coordinates.map(
    (point, index) => {
      return {
        id: `vertex-${index}`,
        type: "Keypoint",
        coords: point,
        drag: (current: LineString, start: Pixel, end: Pixel) => {
          const coords = [...current.coordinates];
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const vertex = coords[index];
          coords[index] = [vertex[0] + dx, vertex[1] + dy];
          return {
            type: "LineString",
            coordinates: coords,
          };
        },
      };
    },
  );

  const edges: EditableElement<LineString>[] = linestring.coordinates
    .slice(close ? 0 : 1)
    .map((e, index) => {
      const s =
        linestring.coordinates[close ? (length + index - 1) % length : index];
      return {
        id: `edge-${index}`,
        type: "Edge",
        coords: [s, e],
        drag: (current: LineString, start: Pixel, end: Pixel) => {
          const index1 = close ? (length + index - 1) % length : index;
          const index2 = close ? index : index + 1;
          const coords = [...current.coordinates];
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const vertex1 = coords[index1];
          coords[index1] = [vertex1[0] + dx, vertex1[1] + dy];
          const vertex2 = coords[index2];
          coords[index2] = [vertex2[0] + dx, vertex2[1] + dy];
          return {
            type: "LineString",
            coordinates: coords,
          };
        },
      };
    });

  return [...vertices, ...edges];
}

function _adaptEditableElemToMultiLineString(
  elem: EditableElement<LineString>,
  index: number,
): EditableElement<MultiLineString> {
  const { drag, id } = elem;
  const dragMultiLinestring = (
    multilinestring: MultiLineString,
    start: Pixel,
    end: Pixel,
  ) => {
    const linestrings = [...multilinestring.coordinates];
    const dragged = drag(
      { type: "LineString", coordinates: linestrings[index] },
      start,
      end,
    ).coordinates;
    linestrings[index] = dragged;
    const ret: MultiLineString = {
      type: "MultiLineString",
      coordinates: linestrings,
    };
    return ret;
  };
  return {
    ...elem,
    id: `${id}-${index}`,
    drag: dragMultiLinestring,
  };
}

export function getMultiLineStringEditableElements(
  geom: MultiLineString,
  closed = false,
): EditableElement<MultiLineString>[] {
  const elems: EditableElement<MultiLineString>[] = [];
  geom.coordinates.forEach((linestring, index) => {
    elems.push(
      ...getLineStringEditableElements(
        {
          type: "LineString",
          coordinates: linestring,
        },
        closed,
      ).map((elem) => _adaptEditableElemToMultiLineString(elem, index)),
    );
  });
  return elems;
}

function _adaptMultiLineStringEditableElemToPolygon(
  elem: EditableElement<MultiLineString>,
): EditableElement<Polygon> {
  const { drag } = elem;
  const dragPolygon = (polygon: Polygon, start: Pixel, end: Pixel) => {
    const dragged = drag(
      { type: "MultiLineString", coordinates: polygon.coordinates },
      start,
      end,
    ).coordinates;
    const ret: Polygon = {
      type: "Polygon",
      coordinates: dragged,
    };
    return ret;
  };
  return {
    ...elem,
    drag: dragPolygon,
  };
}

export function getPolygonEditableElements(
  geom: Polygon,
): EditableElement<Polygon>[] {
  const elems = getMultiLineStringEditableElements(
    {
      type: "MultiLineString",
      coordinates: geom.coordinates,
    },
    true,
  ).map(_adaptMultiLineStringEditableElemToPolygon);
  const areaElement: EditableElement<Polygon> = {
    id: "area",
    type: "Area",
    coords: geom.coordinates,
    drag: (poly: Polygon, start: Pixel, end: Pixel) =>
      shiftPolygon(poly, [start.x, start.y], [end.x, end.y]),
  };
  elems.push(areaElement);
  return elems;
}

function _adaptPolygonEditableElemToMultiPolygon(
  elem: EditableElement<Polygon>,
  index: number,
): EditableElement<MultiPolygon> {
  const { drag, id } = elem;
  const dragMultiPolygon = (
    multipolygon: MultiPolygon,
    start: Pixel,
    end: Pixel,
  ) => {
    const polygons = [...multipolygon.coordinates];
    const dragged = drag(
      { type: "Polygon", coordinates: polygons[index] },
      start,
      end,
    ).coordinates;
    polygons[index] = dragged;
    const ret: MultiPolygon = {
      type: "MultiPolygon",
      coordinates: polygons,
    };
    return ret;
  };
  return {
    ...elem,
    id: `${id}-${index}`,
    drag: dragMultiPolygon,
  };
}

export function getMultiPolygonEditableElements(
  geom: MultiPolygon,
): EditableElement<MultiPolygon>[] {
  const elems: EditableElement<MultiPolygon>[] = [];
  geom.coordinates.forEach((polygon, index) => {
    elems.push(
      ...getPolygonEditableElements({
        type: "Polygon",
        coordinates: polygon,
      }).map((elem) => _adaptPolygonEditableElemToMultiPolygon(elem, index)),
    );
  });
  return elems;
}

export function getGeometryEditableElements(
  geom: Geometry,
  dimensions: Dimensions,
): EditableElement<Geometry>[] {
  const { type } = geom;
  switch (type) {
    case "TimeStamp":
      return getTimeStampEditableElements(
        geom,
        dimensions,
      ) as EditableElement<Geometry>[];

    case "TimeInterval":
      return getTimeIntervalEditableElements(
        geom,
        dimensions,
      ) as EditableElement<Geometry>[];

    case "BoundingBox":
      return getBBoxEditableElements(geom) as EditableElement<Geometry>[];

    case "Point":
      return getPointEditableElements(geom) as EditableElement<Geometry>[];

    case "MultiPoint":
      return getMultiPointEditableElements(geom) as EditableElement<Geometry>[];

    case "LineString":
      return getLineStringEditableElements(geom) as EditableElement<Geometry>[];

    case "MultiLineString":
      return getMultiLineStringEditableElements(
        geom,
      ) as EditableElement<Geometry>[];

    case "Polygon":
      return getPolygonEditableElements(geom) as EditableElement<Geometry>[];

    case "MultiPolygon":
      return getMultiPolygonEditableElements(
        geom,
      ) as EditableElement<Geometry>[];

    default:
      throw Error;
  }
}

function _shiftGeometry(geom: Geometry, start: Pixel, end: Pixel) {
  return shiftGeometry(geom, [start.x, start.y], [end.x, end.y]);
}

const useEditGeometry = createEditHook(
  getGeometryEditableElements,
  _shiftGeometry,
);

export default useEditGeometry;
