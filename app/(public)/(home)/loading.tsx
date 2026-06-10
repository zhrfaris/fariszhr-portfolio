import { Skeleton } from "@/components/shadcn/skeleton";

export default function Loading() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center py-[40px] md:py-[60px]">
      <div className="md:max-w-[840px] w-full mx-auto flex flex-col gap-12 px-4">
        {/* Profile section */}
        <div className="flex flex-col items-center gap-4">
          {/* Avatar */}
          <Skeleton className="w-[100px] h-[100px] rounded-full bg-[#e5e5e5]" />
          {/* Name */}
          <Skeleton className="h-8 w-[200px] rounded-lg bg-[#e5e5e5]" />
          {/* Tagline */}
          <Skeleton className="h-5 w-[280px] rounded-lg bg-[#e5e5e5]" />
        </div>

        {/* Showcase cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[260px] rounded-2xl bg-[#e5e5e5]" />
          <Skeleton className="h-[260px] rounded-2xl bg-[#e5e5e5]" />
          <Skeleton className="h-[260px] rounded-2xl bg-[#e5e5e5]" />
          <Skeleton className="h-[260px] rounded-2xl bg-[#e5e5e5]" />
        </div>

        {/* CTA links */}
        <div className="flex items-center justify-center gap-6">
          <Skeleton className="h-5 w-[120px] rounded-lg bg-[#e5e5e5]" />
          <Skeleton className="h-5 w-[120px] rounded-lg bg-[#e5e5e5]" />
          <Skeleton className="h-5 w-[120px] rounded-lg bg-[#e5e5e5]" />
        </div>
      </div>
    </div>
  );
}
