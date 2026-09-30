import { create } from "zustand";

export type Lang = "en" | "id";

type State = {
  saveAsDraft: boolean;
  title: string;
  slug: string;
  excerpt: string;
  isRestricted: boolean | null;
  password: string | null;
  previewSectionAmount: number | null;
  isDirty: boolean;
};

type Action = {
  setSlug: (slug: string) => void;
  setTitle: (title: string) => void;
  setExcerpt: (excerpt: string) => void;
  setSaveAsDraft: (bool: boolean) => void;
  setIsRestricted: (data: boolean | null) => void;
  setPassword: (data: string | null) => void;
  setPreviewSectionAmount: (data: number | null) => void;
  setDirty: (bool: boolean) => void;
};

export const usePostForm = create<State & Action>((set) => ({
  slug: "",
  title: "",
  excerpt: "",
  saveAsDraft: false,
  isRestricted: null,
  password: null,
  previewSectionAmount: null,
  isDirty: false,
  setSlug: (slug) => set(() => ({ slug })),
  setTitle: (title) => set(() => ({ title })),
  setExcerpt: (excerpt) => set(() => ({ excerpt })),
  setSaveAsDraft: (bool) => set(() => ({ saveAsDraft: bool })),
  setDirty: (bool) => set(() => ({ isDirty: bool })),
  setIsRestricted: (data) =>
    set(() => {
      if (!data) {
        return {
          isRestricted: data,
          password: null,
          previewSectionAmount: null,
        };
      }

      return {
        isRestricted: data,
      };
    }),
  setPassword: (data) => set(() => ({ password: data })),
  setPreviewSectionAmount: (data) =>
    set(() => ({ previewSectionAmount: data })),
}));
