import { Skeleton } from "@/components/shadcn/skeleton";

/**
 * Standing in for the hero while it loads. Mirrors the real layout rather than
 * a generic spinner: identity block on the left of the header row with the
 * blurb beside it, the zine spread centred below, then the case-study heading
 * and the 2x2 grid. public/icons/loading.svg is the reference for the
 * proportions; this is built from the same tokens as the page so it holds up at
 * any width instead of only at the 1440 that file was drawn at.
 */
const Bar = ({ className }: { className?: string }) => (
  <Skeleton className={`rounded-md bg-[#e4e4e4] ${className ?? ""}`} />
);

export default function Loading() {
  return (
    <div className="min-h-svh bg-[#f0f0f0]" aria-busy aria-label="Loading">
      {/* hero */}
      <div className="mx-auto w-full max-w-[784px] px-8 pt-[clamp(34px,8.6vh,88px)]">
        {/* header row: identity + blurb */}
        <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
          <div className="flex flex-none items-center gap-[18px]">
            <Skeleton className="size-[clamp(56px,8.2vh,84px)] rounded-[calc(clamp(56px,8.2vh,84px)/4.2)] bg-[#e4e4e4]" />
            <div className="flex flex-col gap-2">
              <Bar className="h-[21px] w-[196px]" />
              <Bar className="h-[15px] w-[132px]" />
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <Bar className="h-[14px] w-[62%]" />
            <Bar className="h-[13px] w-full" />
            <Bar className="h-[13px] w-[84%]" />
          </div>
        </div>

        {/* the zine spread */}
        <Skeleton className="mx-auto mt-[clamp(24px,5.7vh,58px)] aspect-[1.5/1] w-full max-w-[740px] rounded-xl bg-[#e4e4e4]" />

        {/* zine copy + the coming-soon badge */}
        <div className="mt-[clamp(32px,6.4vh,68px)] flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-1 flex-col gap-2">
            <Bar className="h-[14px] w-[54%]" />
            <Bar className="h-[13px] w-full" />
            <Bar className="h-[13px] w-[92%]" />
            <Bar className="h-[13px] w-[68%]" />
          </div>
          <Skeleton className="h-[34px] w-[202px] flex-none rounded-lg bg-[#e4e4e4]" />
        </div>
      </div>

      {/* the white surface with the case studies */}
      <div className="mt-[clamp(24px,6vh,64px)] bg-white pb-16 pt-8">
        <div className="mx-auto w-full max-w-[896px] px-8">
          <div className="flex flex-col items-center gap-[5px]">
            <Bar className="h-[18px] w-[188px]" />
            <Bar className="h-[14px] w-[268px]" />
          </div>
          <div className="mt-[clamp(22px,3.6vh,40px)] grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-[240px] rounded-xl bg-[#f0f0f0] md:h-[240px]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
