import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <div>
        <Loader className="size-10 animate-spin" />
      </div>
      <div className="text-2xl font-bold">
        Loading...
      </div>
    </div>
  );
}
