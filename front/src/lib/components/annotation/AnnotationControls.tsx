import { ReactNode } from "react";

import {
  AnnotationProjectIcon,
  BoundingBoxIcon,
  DeleteIcon,
  EditIcon,
  LineStringIcon,
  SelectIcon,
  TimeIntervalIcon,
  TimeStampIcon,
} from "@/lib/components/icons";
import Select from "@/lib/components/inputs/Select";
import Button from "@/lib/components/ui/Button";
import KeyboardKey from "@/lib/components/ui/KeyboardKey";
import Tooltip from "@/lib/components/ui/Tooltip";

import type { AnnotationMode, GeometryType } from "@/lib/types";

type Node = {
  id: string;
  label: ReactNode;
  value: string;
};

// @ts-ignore   TODO Add all geometry types
const geometryTypes: Record<GeometryType, Node> = {
  TimeStamp: {
    id: "TimeStamp",
    label: <TimeStampIcon className="w-5 h-5" />,
    value: "TimeStamp",
  },
  TimeInterval: {
    id: "TimeInterval",
    label: <TimeIntervalIcon className="w-5 h-5" />,
    value: "TimeInterval",
  },
  BoundingBox: {
    id: "BoundingBox",
    label: <BoundingBoxIcon className="w-5 h-5" />,
    value: "BoundingBox",
  },
  LineString: {
    id: "LineString",
    label: <LineStringIcon className="w-5 h-5" />,
    value: "LineString",
  },
};

export default function AnnotationControls({
  geometryType,
  mode = "select",
  onDraw,
  onDelete,
  onSelect,
  onSelectGeometryType,
}: {
  mode?: AnnotationMode;
  geometryType: GeometryType;
  onDraw?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
  onSelectGeometryType?: (type: GeometryType) => void;
}) {
  return (
    <div className="flex space-x-2">
      <Tooltip
        tooltip={
          <div className="inline-flex gap-1">
            Create
            <span className="text-xs">
              <KeyboardKey keys={["a"]} />
            </span>
          </div>
        }
        placement="bottom"
        autoPlacement={false}
      >
        <Button
          variant={mode === "draw" ? "primary" : "secondary"}
          onClick={onDraw}
        >
          <AnnotationProjectIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      {!(mode === "edit") ? (
        <Tooltip
          tooltip={
            <div className="inline-flex gap-1">
              Select
              <span className="text-xs">
                <KeyboardKey keys={["s"]} />
              </span>
            </div>
          }
          placement="bottom"
          autoPlacement={false}
        >
          <Button
            variant={mode == "select" ? "primary" : "secondary"}
            onClick={onSelect}
          >
            <SelectIcon className="w-5 h-5" />
          </Button>
        </Tooltip>
      ) : (
        <Button variant="warning" onClick={onSelect}>
          <EditIcon className="w-5 h-5" />
        </Button>
      )}
      <Tooltip
        tooltip={
          <div className="inline-flex gap-1">
            Delete
            <span className="text-xs">
              <KeyboardKey keys={["d"]} />
            </span>
          </div>
        }
        placement="bottom"
        autoPlacement={false}
      >
        <Button
          variant={mode === "delete" ? "danger" : "secondary"}
          onClick={onDelete}
        >
          <DeleteIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Select
        placement="bottom"
        options={Object.values(geometryTypes)}
        selected={geometryTypes[geometryType]}
        onChange={(type) => onSelectGeometryType?.(type as GeometryType)}
      />
    </div>
  );
}
