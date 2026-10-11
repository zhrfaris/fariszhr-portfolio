import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-full w-full flex items-end justify-end px-8 py-4">
      <div className="flex items-center gap-6 justify-center">
        <div>
          <Loader className="size-8 animate-spin" />
        </div>
        <div className={cn("text-base")}>Loading...</div>
      </div>
    </div>
  );
}
