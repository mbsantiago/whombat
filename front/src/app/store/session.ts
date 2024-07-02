// Purpose: State management for session data
import { StateCreator } from "zustand";

import type { User } from "@/lib/types";

interface SessionSlice {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const createSessionSlice: StateCreator<SessionSlice> = (set) => ({
  user: null,
  login: (user: User) => set({ user }),
  logout: () => set({ user: null }),
});

export { createSessionSlice, type SessionSlice };
