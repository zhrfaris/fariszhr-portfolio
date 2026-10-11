import { unstable_cache } from "next/cache";

import { getPostsShowCase } from "@/actions/post/get";
import { countRequestDuration } from "@/actions/utils";
import { MAIN_USERNAME } from "@/lib/db";

export { getUser } from "@/actions/user/get";
export { getPublicGalleryPhotos } from "@/actions/gallery/get";

/** Case studies for "/": the same Live posts the old home page showed. */
export const getLandingPosts = unstable_cache(
  async () => {
    return await countRequestDuration(getPostsShowCase, MAIN_USERNAME);
  },
  ["landing-posts"],
  { revalidate: 60 * 10, tags: ["posts"] },
);

export type LandingPost = Awaited<ReturnType<typeof getLandingPosts>>[number];
