import { source_serif_pro } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <div>
        <Loader className="size-10 animate-spin" />
      </div>
      <div className={cn("text-2xl font-bold", source_serif_pro.className)}>
        Loading...
      </div>
    </div>
  );
}
