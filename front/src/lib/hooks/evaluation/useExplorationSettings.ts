import { useCallback, useState } from "react";

type ExplorationControls = {
  showPredictions: boolean;
  showAnnotations: boolean;
  threshold: number;
  toggleAnnotations: () => void;
  togglePredictions: () => void;
  setThreshold: (threshold: number) => void;
};

export default function useExplorationSettings(
  props: {
    threshold?: number;
    showAnnotations?: boolean;
    showPredictions?: boolean;
  } = {},
): ExplorationControls {
  const [threshold, setThreshold] = useState<number>(props.threshold || 0.5);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(
    props.showAnnotations === undefined ? true : props.showAnnotations,
  );
  const [showPredictions, setShowPredictions] = useState<boolean>(
    props.showPredictions === undefined ? true : props.showPredictions,
  );

  const toggleAnnotations = useCallback(() => {
    setShowAnnotations((prev) => !prev);
  }, []);

  const togglePredictions = useCallback(() => {
    setShowPredictions((prev) => !prev);
  }, []);

  return {
    showPredictions,
    showAnnotations,
    threshold,
    toggleAnnotations,
    togglePredictions,
    setThreshold,
  };
}
