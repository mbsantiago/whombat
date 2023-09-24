import Button from "@/components/Button";
import Tooltip from "@/components/Tooltip";
import Select from "@/components/Select";
import {
  AnnotationProjectIcon,
  DeleteIcon,
  EditIcon,
  SelectIcon,
  BoundingBoxIcon,
  TimeIntervalIcon,
  TimeStampIcon,
} from "@/components/icons";

type SupportedGeometryType = "TimeStamp" | "TimeInterval" | "BoundingBox";

const geometryTypes = {
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
};

export default function AnnotationControls({
  isDrawing,
  isDeleting,
  isSelecting,
  isEditing,
  geometryType,
  onDraw,
  onDelete,
  onSelect,
  onSelectGeometryType,
}: {
  isDrawing: boolean;
  isDeleting: boolean;
  isSelecting: boolean;
  isEditing: boolean;
  geometryType: SupportedGeometryType;
  onDraw: () => void;
  onDelete: () => void;
  onSelect: () => void;
  onSelectGeometryType: (type: SupportedGeometryType) => void;
}) {
  return (
    <div className="flex space-x-2">
      <Tooltip tooltip="Create a new annotation" placement="bottom">
        <Button variant={isDrawing ? "primary" : "secondary"} onClick={onDraw}>
          <AnnotationProjectIcon className="w-5 h-5" />
        </Button>
      </Tooltip>
      {!isEditing ? (
        <Tooltip tooltip="Select an annotation" placement="bottom">
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
      <Tooltip tooltip="Delete an annotation" placement="bottom">
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
        onChange={(type) => onSelectGeometryType(type as SupportedGeometryType)}
      />
    </div>
  );
}
