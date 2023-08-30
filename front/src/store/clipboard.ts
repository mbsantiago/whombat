import { StateCreator } from "zustand";

interface ClipboardSlice {
  clipboard: string;
  copy: (text: string) => void;
}

const createClipboardSlice: StateCreator<ClipboardSlice> = (set) => ({
  clipboard: "",
  copy: (text: string) => set({ clipboard: text }),
});


export { createClipboardSlice, type ClipboardSlice}
