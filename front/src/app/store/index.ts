// Global store for the application
import { create } from "zustand";
import { createSessionSlice, type SessionSlice } from "./session";

type Store = SessionSlice;

const useStore = create<Store>()((...a) => ({
  ...createSessionSlice(...a),
}));

export default useStore;
