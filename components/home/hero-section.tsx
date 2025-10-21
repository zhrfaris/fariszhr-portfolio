import Link from "next/link";
import Image from "next/image";
import HomeCtaButton from "./home-cta-button";
import TooltipWrapper from "../wrappers/tooltip-wrapper";

import {cn} from "@/lib/utils";
import {User} from "@/actions/user/get/type";
import {source_serif_pro} from "@/lib/fonts";
import {Workplace} from "@/actions/workplace/get/types";
import {Avatar, AvatarFallback, AvatarImage} from "../shadcn/avatar";
// import {MAIN_USERNAME} from "@/lib/db";
// import { unstable_cache } from "next/cache";
// import { getWorkplacesBySlug } from "@/actions/workplace/get";
// import { countRequestDuration } from "@/actions/utils";

// const getWorkplaces = unstable_cache(
//   async () => {
//     return await countRequestDuration(getWorkplacesBySlug, MAIN_USERNAME);
//   },
//   ["workplaces"],
//   { revalidate: 60 * 10, tags: ["workplaces"] }
// );

const HeroSection = async ({user}: {user?: User}) => {
  // const workplaces = await getWorkplaces();

  const WorkplaceCard = ({workplace}: {workplace: NonNullable<Workplace>}) => {
    const WorkplaceWrapper = ({children}: {children: React.ReactNode}) => {
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
          <div className="h-6 max-w-32 md:max-w-36 md:h-10 max-h-10 rounded-lg">
            <Image
              alt=""
              src={workplace.image.img_url}
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
    <div className="p-4 space-y-2 md:space-y-4 text-center flex flex-col items-center justify-start md:justify-center min-h-[95vh] md:min-h-screen mt-12 md:mt-0 gap-8 md:gap-0">
      <div className="flex flex-col items-center justify-start md:justify-center md:flex-1 gap-4 md:gap-8 pb-0 pt-8 md:pt-0">
        <Avatar className="size-[120px]">
          <AvatarImage
            src={user?.photo?.img_url ?? "/faris-profile-pict-grayscale.png"}
          />
          <AvatarFallback>ZHR</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold">
            {user?.name ?? "Muhammad Faris Azhar"}
          </h1>
          <p>{user?.occupation ?? "Product Designer"}</p>
        </div>
        <h2
          className={cn(
            source_serif_pro.className,
            "text-3xl md:text-6xl font-semibold max-w-screen-md md:!leading-[4.25rem]"
          )}
        >
          {user?.tagline ?? "Humanizing technology through design"}
        </h2>
        <div className="pt-8">
          <HomeCtaButton />
        </div>
      </div>
      <div className="flex min-h-[100px] w-full items-center justify-center gap-4 py-4 md:py-12">
        <h4 className="text-sm md:text-base">Currently Working at</h4>
        <WorkplaceCard
          workplace={{
            id: "1",
            image: {
              img_height: 49,
              img_width: 169,
              img_type: "",
              img_url: "/gojek-logo.png",
              img_url_placeholder: "",
              img_url_thumbnail: "",
              public_id: "1",
            },
            name: "Gojek",
            slug: "",
            userId: "1",
            url: null,
          }}
        />
      </div>
      {/* <div className="hidden md:flex min-h-[120px] w-full flex-col items-center justify-center gap-6 py-4 md:py-12">
        <h4 className="text-sm md:text-base">
          The Company I&apos;ve been collaborated with
        </h4>
        <div className="flex items-center gap-6 gap-y-4 flex-wrap justify-center">
          {workplaces.map((workplace, i) => (
            <WorkplaceCard key={i} workplace={workplace} />
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default HeroSection;
