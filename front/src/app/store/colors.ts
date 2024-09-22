import { StateCreator } from "zustand";

import type { Tag } from "@/lib/types";
import { type Color, getRandomColor, getTagKey } from "@/lib/utils/tags";

export type ColorsSlice = {
  colors: {
    tags: { [key: string]: Color };
  };
  setTagColor: (tag: Tag, color: Color) => void;
  getTagColor: (tag: Tag) => Color;
  clearTagColors: () => void;
};

export const createColorsSlice: StateCreator<ColorsSlice> = (set, get) => ({
  colors: {
    tags: {},
  },
  setTagColor: (tag: Tag, color: Color) => {
    set((state) => ({
      colors: {
        tags: {
          ...state.colors.tags,
          [getTagKey(tag)]: color,
        },
      },
    }));
  },
  getTagColor: (tag: Tag) => {
    const { tags } = get().colors;
    const key = getTagKey(tag);
    if (tags[key]) {
      return tags[key];
    } else {
      const color = getRandomColor();
      set((state) => ({
        colors: {
          tags: {
            ...state.colors.tags,
            [key]: color,
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
  },
});
