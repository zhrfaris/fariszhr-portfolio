import { PostSectionContent, PostSection } from "@/actions/post/create/types";
import { create } from "zustand";

export type Lang = "en" | "id";

type State = {
  sections: PostSection[];
  contents: PostSectionContent[];
  saveAsDraft: boolean;
  showFormSection: boolean;
  showFormContent: boolean;
  editContentData: PostSectionContent | null;
  editSectionData: PostSection | null;
};

type Action = {
  setSaveAsDraft: (bool: boolean) => void;
  setShowFormSection: (bool: boolean) => void;
  setShowFormContent: (bool: boolean) => void;
  setContents: (contents: PostSectionContent[]) => void;
  setSections: (sections: PostSection[]) => void;
  setEditContentData: (data: PostSectionContent | null) => void;
  setEditSectionData: (data: PostSection | null) => void;
};

export const usePostForm = create<State & Action>((set) => ({
  saveAsDraft: false,
  showFormSection: false,
  showFormContent: false,
  contents: [],
  sections: [],
  editContentData: null,
  editSectionData: null,
  setEditContentData: (data) => set(() => ({ editContentData: data })),
  setEditSectionData: (data) => set(() => ({ editSectionData: data })),
  setSections: (sections) => set(() => ({ sections })),
  setContents: (contents) => set(() => ({ contents })),
  setSaveAsDraft: (bool) => set(() => ({ saveAsDraft: bool })),
  setShowFormSection: (bool) => set(() => ({ showFormSection: bool })),
  setShowFormContent: (bool) => set(() => ({ showFormContent: bool })),
}));
