import { source_serif_pro } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Workplace } from "@/actions/workplace/get/types";
import Link from "next/link";
import TooltipWrapper from "../wrappers/tooltip-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";
import HomeCtaButton from "./home-cta-button";
import { getWorkplacesBySlug } from "@/actions/workplace/get";
import { MAIN_USERNAME } from "@/lib/db";
import { User } from "@/actions/user/get/type";

const HeroSection = async ({ user }: { user?: User }) => {
  const workplaces = await getWorkplacesBySlug(MAIN_USERNAME);

  const WorkplaceCard = ({
    workplace,
  }: {
    workplace: NonNullable<Workplace>;
  }) => {
    const WorkplaceWrapper = ({ children }: { children: React.ReactNode }) => {
      if (!workplace.url) {
        return <>{children}</>;
      }

      return (
        <Link href={workplace.url} target="_blank" rel="noopener noreferrer">
          {children}
        </Link>
      );
    };

    return (
      <WorkplaceWrapper>
        <TooltipWrapper tooltip_text={workplace.name} side="bottom">
          <div className="h-12 rounded-lg">
            <Image
              alt=""
              src={workplace.image.img_url}
              placeholder="blur"
              blurDataURL={workplace.image.img_url_placeholder}
              width={workplace.image.img_width}
              height={workplace.image.img_height}
              className="size-full object-contain max-w-40 grayscale"
            />
          </div>
        </TooltipWrapper>
      </WorkplaceWrapper>
    );
  };

  return (
    <div className="p-4 space-y-4 text-center flex flex-col items-center justify-center min-h-screen mt-12 md:mt-0">
      <div className="flex flex-col  items-center justify-center flex-1 gap-8">
        <Avatar className="size-[120px]">
          <AvatarImage src={user?.photo?.img_url} />
          <AvatarFallback>ZHR</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {user?.name ?? "Muhammad Faris Azhar"}
          </h1>
          <p>{user?.occupation ?? "Product Designer"}</p>
        </div>
        <h2
          className={cn(
            source_serif_pro.className,
            "text-5xl md:text-6xl font-semibold max-w-screen-md"
          )}
        >
          {user?.tagline ?? "Humanizing technology through design"}
        </h2>
        <div className="pt-8">
          <HomeCtaButton />
        </div>
      </div>
      <div className="min-h-[100px] w-full flex flex-col items-center justify-center gap-6 py-12">
        <h4>The Company I&apos;ve been collaborated with</h4>
        <div className="flex items-center gap-8 flex-wrap justify-center">
          {workplaces.map((workplace, i) => (
            <WorkplaceCard key={i} workplace={workplace} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
