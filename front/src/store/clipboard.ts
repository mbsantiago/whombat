import { StateCreator } from "zustand";

interface ClipboardSlice {
  clipboard: any;
  copy: (value: any) => void;
}

const createClipboardSlice: StateCreator<ClipboardSlice> = (set) => ({
  clipboard: "",
  copy: (value: any) => set({ clipboard: value }),
});

export { createClipboardSlice, type ClipboardSlice };
