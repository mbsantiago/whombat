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
import KeyboardKey from "@/components/KeyboardKey";
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
          tooltip={
            <div className="inline-flex gap-1">
              Select
              <span className="text-xs">
                <KeyboardKey code="s" />
              </span>
            </div>
          }
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
        tooltip={
          <div className="inline-flex gap-1">
            Create
            <span className="text-xs">
              <KeyboardKey code="a" />
            </span>
          </div>
        }
        placement="bottom"
        autoPlacement={false}
      >
        <Button variant={isDrawing ? "primary" : "secondary"} onClick={onDraw}>
          <AnnotationProjectIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      {!isEditing ? (
        <Tooltip
          tooltip={
            <div className="inline-flex gap-1">
              Select
              <span className="text-xs">
                <KeyboardKey code="s" />
              </span>
            </div>
          }
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
        tooltip={
          <div className="inline-flex gap-1">
            Delete
            <span className="text-xs">
              <KeyboardKey code="d" />
            </span>
          </div>
        }
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
