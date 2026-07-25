import { Skeleton } from "@/components/shadcn/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header image area */}
      <div className="h-[180px] md:h-[50vh] max-h-[500px] bg-[#f5f5f5]" />

      <div className="px-6 pb-24">
        <div className="max-w-screen-md mx-auto space-y-8 py-6 md:py-12">
          {/* Workplace logo + categories */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-[18px] w-[72px] md:h-[22px] md:w-[90px] rounded-[4px] bg-[#e5e5e5]" />
            <Skeleton className="h-[16px] w-[180px] md:h-[18px] md:w-[220px] rounded-[4px] bg-[#e5e5e5]" />
          </div>

          {/* Title lines */}
          <div className="space-y-3">
            <Skeleton className="h-[28px] w-[65%] md:h-[38px] rounded-[6px] bg-[#e5e5e5]" />
            <Skeleton className="h-[28px] w-[75%] md:h-[38px] rounded-[6px] bg-[#e5e5e5]" />
            <Skeleton className="h-[28px] w-[70%] md:h-[38px] rounded-[6px] bg-[#e5e5e5]" />
          </div>

          {/* Section skeleton */}
          <div className="space-y-6 pb-6 border-b">
            <Skeleton className="h-[18px] w-[160px] md:h-[22px] md:w-[200px] rounded-[4px] bg-[#e5e5e5]" />
            <Skeleton className="h-[16px] w-[90%] md:h-[18px] rounded-[4px] bg-[#e5e5e5]" />
            <Skeleton className="h-[16px] w-[78%] md:h-[18px] rounded-[4px] bg-[#e5e5e5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
