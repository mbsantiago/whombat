import { createContext } from "react";

type RecordingContextType = {
  recording_id: number;
};

const RecordingContext = createContext<RecordingContextType>({
  recording_id: -1,
});

export default RecordingContext;
