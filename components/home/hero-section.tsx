import Image from "next/image";

import { cn } from "@/lib/utils";
import { User } from "@/actions/user/get/type";
import { source_serif_pro } from "@/lib/fonts";
import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";
import ShowcaseSection from "./showcase-section";
import { unstable_cache } from "next/cache";
import { countRequestDuration } from "@/actions/utils";
import { getPostsShowCase } from "@/actions/post/get";
import { MAIN_USERNAME } from "@/lib/db";
import { IconMailFilled } from "@tabler/icons-react";
import LinkedInIcon from "../icons/linkedin-icon";
import PaperIcon from "../icons/paper-icon";
import Link from "next/link";

const getPosts = unstable_cache(
  async () => {
    return await countRequestDuration(getPostsShowCase, MAIN_USERNAME);
  },
  ["posts"],
  { revalidate: 60 * 10, tags: ["posts"] },
);

export type Post = Awaited<ReturnType<typeof getPosts>>[number];
export type Category = Post["categories"][number];

const HeroSection = async ({ user }: { user?: User }) => {
  const posts: Post[] = await getPosts();

  return (
    <div className="w-full min-h-screen flex items-center">
      <div className="md:max-w-[840px] mx-auto flex flex-col gap-12 py-[80px] md:py-[120px] px-4">
        {/* profile */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-16 ">
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="size-[86px] rounded-[24px] border-[6px] border-white shadow-[0px_4px_20px_0px_#0000001A]">
              <AvatarImage
                src={
                  user?.photo?.img_url ?? "/faris-profile-pict-grayscale.png"
                }
              />
              <AvatarFallback>ZHR</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1">
              <h1
                className={cn(
                  source_serif_pro.className,
                  "text-xl md:text-2xl font-semibold whitespace-nowrap",
                )}
              >
                {user?.name ?? "Muhammad Faris Azhar"}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">
                  {user?.occupation ?? "Product Designer"} at
                </p>
                <Link
                  href="https://gojek.design/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="w-[63px] h-[18px] relative">
                    <Image
                      src="/gojek-logo.png"
                      alt="gojek logo"
                      width={252}
                      height={72}
                      className="size-full brightness-50 contrast-100 grayscale hover:grayscale-0 hover:brightness-100 hover:contrast-100"
                    />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-[350px] flex flex-col gap-2">
            <h2 className="text-sm font-semibold">
              {user?.tagline ?? "Humanizing technology through design"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Currently building the spatial layer across Southeast Asia&apos;s
              largest on-demand platform, covering ride-hailing, food delivery,
              and logistics.
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          {/* posts */}
          <ShowcaseSection posts={posts} />

          {/* links */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {user?.email && (
              <Link
                href={`mailto:${user?.email}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-1 group">
                  <IconMailFilled />
                  <p className="group-hover:underline text-sm">{user?.email}</p>
                </div>
              </Link>
            )}
            {user?.linkedin_url && (
              <Link
                href={user?.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-1 group">
                  <LinkedInIcon />
                  <p className="group-hover:underline text-sm">
                    linkedin.com/fariszhr
                  </p>
                </div>
              </Link>
            )}

            {user?.cv_url && (
              <Link
                href={user?.cv_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-1 group">
                  <PaperIcon />
                  <p className="group-hover:underline text-sm">Download CV</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
