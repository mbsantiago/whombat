import { type Tag } from "@/api/tags";
import { StateCreator } from "zustand";

const COLOR_NAMES = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

const LEVELS = [1, 2, 3, 4, 5, 6];

type Color = {
  color: string;
  level: number;
};

export type ColorsSlice = {
  colors: {
    tags: { [key: number]: Color };
  };
  setTagColor: (tag: Tag, color: Color) => void;
  getTagColor: (tag: Tag) => Color;
  clearTagColors: () => void;
}

export const createColorsSlice: StateCreator<ColorsSlice> = (set, get) => ({
  colors: {
    tags: {},
  },
  setTagColor: (tag: Tag, color: Color) => {
    set((state) => ({
      colors: {
        tags: {
          ...state.colors.tags,
          [tag.id]: color,
        },
      },
    }));
  },
  getTagColor: (tag: Tag) => {
    const { tags } = get().colors;
    if (tags[tag.id]) {
      return tags[tag.id];
    } else {
      const name = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
      const level = LEVELS[Math.floor(Math.random() * LEVELS.length)];
      const color = { color: name, level };
      set((state) => ({
        colors: {
          tags: {
            ...state.colors.tags,
            [tag.id]: color,
          },
        },
      }));
      return color;
    }
  },
  clearTagColors: () => {
    set(() => ({
      colors: {
        tags: {},
      },
    }));
  }
});
