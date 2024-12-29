import { User } from "@/actions/user/get/type";
import { create } from "zustand";

export type Lang = "en" | "id";

type State = {
  user: User | null;
};

type Action = {
  setUser: (user: User) => void;
};

export const useUser = create<State & Action>((set) => ({
  user: null,
  setUser: (user) => set(() => ({ user })),
}));
