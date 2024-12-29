"use client";

import { source_serif_pro } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import useLenisScroll from "@/hooks/use-lenis-scroll";
import { User } from "@/actions/user/get/type";
import { useUser } from "@/hooks/use-user";
import { useEffect } from "react";
import Image from "next/image";
import MainButton from "../common/main-button";
import { MoveDown } from "lucide-react";

const HeroSection = ({ user }: { user: User }) => {
  const { scrollToSectionId } = useLenisScroll();
  const scrollToShowcase = () => scrollToSectionId("showcase");
  const setUser = useUser((state) => state.setUser);

  useEffect(() => {
    if (!user) return;
    setUser(user);
  }, [user, setUser]);

  return (
    <div className="p-4 space-y-4 text-center flex flex-col items-center justify-center min-h-screen mt-12 md:mt-0">
      <div className="flex flex-col  items-center justify-center flex-1 gap-8">
        <div className="profile-pict size-[120px] rounded-full overflow-hidden bg-zinc-300 relative">
          {user?.photo?.img_url && (
            <Image
              alt=""
              src={user?.photo?.img_url}
              placeholder="blur"
              blurDataURL={user?.photo?.img_url_placeholder}
              fill
            />
          )}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{user?.name}</h1>
          <p>{user?.occupation}</p>
        </div>
        <h2
          className={cn(
            source_serif_pro.className,
            "text-5xl md:text-6xl font-semibold max-w-screen-md"
          )}
        >
          {user?.tagline}
        </h2>
        <div className="pt-8">
          <MainButton onClick={scrollToShowcase}>
            <MoveDown />
            See Works & Experience
          </MainButton>
        </div>
      </div>
      <div className="min-h-[100px] w-full flex flex-col items-center justify-center gap-6 py-12">
        <h4>The Company I&apos;ve been collaborated with</h4>
        <div className="flex items-center gap-8 flex-wrap justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-zinc-300 w-[150px]"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
