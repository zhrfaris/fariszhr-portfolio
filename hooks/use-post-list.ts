import { Post } from "@/actions/post/get/types";
import { create } from "zustand";

export type Lang = "en" | "id";

type State = {
  isReordering: boolean;
  posts: NonNullable<Post>[];
  postsToReorderAfterDelete: NonNullable<Post>[];
  initialPosts: NonNullable<Post>[];
};

type Action = {
  setPosts: (posts: NonNullable<Post>[]) => void;
  setIsReordering: (isReordering: boolean) => void;
  setInitialPosts: (posts: NonNullable<Post>[]) => void;
  setPostsToReorderAfterDelete: (posts: NonNullable<Post>[]) => void;
};

export const usePostList = create<State & Action>((set) => ({
  posts: [],
  initialPosts: [],
  isReordering: false,
  postsToReorderAfterDelete: [],
  setPosts: (posts) => set(() => ({ posts })),
  setInitialPosts: (initialPosts) => set(() => ({ initialPosts })),
  setIsReordering: (isReordering) => set(() => ({ isReordering })),
  setPostsToReorderAfterDelete: (postsToReorderAfterDelete) =>
    set(() => ({ postsToReorderAfterDelete })),
}));
