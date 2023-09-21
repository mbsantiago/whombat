import { useMouse } from "react-use";

export type MouseState = {
  docX: number;
  docY: number;
  posX: number;
  posY: number;
  elX: number;
  elY: number;
  elH: number;
  elW: number;
};

export { useMouse };
