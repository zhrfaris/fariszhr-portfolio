import { User } from "@/actions/user/get/type";
import { Workplace } from "@/actions/workplace/get/types";
import { create } from "zustand";

type State = {
  user: User | null;
  workplaces: NonNullable<Workplace>[];
};

type Action = {
  setUser: (user: User) => void;
  setWorkplaces: (workplaces: NonNullable<Workplace>[]) => void;
};

export const usePublicData = create<State & Action>((set) => ({
  user: null,
  workplaces: [],
  setUser: (user) => set(() => ({ user })),
  setWorkplaces: (workplaces) => set(() => ({ workplaces })),
}));
