import {
  RectangleStackIcon,
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  HomeIcon as HomeIconOutline,
  InboxIcon,
  ArrowRightOnRectangleIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";

function WhombatIcon() {
  return <img src="/whombat.svg" />;
}

function DatasetIcon() {
  return <RectangleStackIcon />;
}

function AnnotationProjectIcon() {
  return <PencilSquareIcon />;
}

function ExplorationIcon() {
  return <DocumentMagnifyingGlassIcon />;
}

function EvaluationIcon() {
  return <ClipboardDocumentCheckIcon />;
}

function HomeIcon() {
  return <HomeIconOutline />;
}

function MessagesIcon() {
  return <InboxIcon />;
}

function SettingsIcon() {
  return <Cog8ToothIcon />;
}

function LogOutIcon() {
  return <ArrowRightOnRectangleIcon />;
}

export {
  WhombatIcon,
  DatasetIcon,
  AnnotationProjectIcon,
  ExplorationIcon,
  EvaluationIcon,
  MessagesIcon,
  SettingsIcon,
  LogOutIcon,
  HomeIcon,
};
