import { ReactNode } from "react";

import Button from "@/components/Button";
import {
  AnnotationProjectIcon,
  BoundingBoxIcon,
  DeleteIcon,
  EditIcon,
  LineStringIcon,
  SelectIcon,
  TimeIntervalIcon,
  TimeStampIcon,
} from "@/components/icons";
import Select from "@/components/inputs/Select";
import Tooltip from "@/components/Tooltip";

import type { GeometryType } from "@/types";

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
  isDrawing,
  isDeleting,
  isSelecting,
  isEditing,
  geometryType,
  disabled = false,
  onDraw,
  onDelete,
  onSelect,
  onSelectGeometryType,
}: {
  isDrawing: boolean;
  isDeleting: boolean;
  isSelecting: boolean;
  isEditing: boolean;
  geometryType: GeometryType;
  disabled?: boolean;
  onDraw?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
  onSelectGeometryType?: (type: GeometryType) => void;
}) {
  if (disabled)
    return (
      <div className="flex space-x-2">
        <Tooltip
          tooltip="Select an annotation"
          placement="bottom"
          autoPlacement={false}
        >
          <Button
            variant={isSelecting ? "primary" : "secondary"}
            onClick={onSelect}
          >
            <SelectIcon className="w-5 h-5" />
          </Button>
        </Tooltip>
      </div>
    );

  return (
    <div className="flex space-x-2">
      <Tooltip
        tooltip="Create a new annotation"
        placement="bottom"
        autoPlacement={false}
      >
        <Button variant={isDrawing ? "primary" : "secondary"} onClick={onDraw}>
          <AnnotationProjectIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      {!isEditing ? (
        <Tooltip
          tooltip="Select an annotation"
          placement="bottom"
          autoPlacement={false}
        >
          <Button
            variant={isSelecting ? "primary" : "secondary"}
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
        tooltip="Delete an annotation"
        placement="bottom"
        autoPlacement={false}
      >
        <Button
          variant={isDeleting ? "danger" : "secondary"}
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
