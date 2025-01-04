import MainButton from "@/components/common/main-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { source_serif_pro } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import Image from "next/image";

const ComingSoonPage = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[75vh] gap-8 max-w-screen-sm mx-auto p-8">
      <Image src="/hammer-wrench.png" alt="" width={100} height={100} />
      <h1
        className={cn(
          "text-5xl font-bold text-center",
          source_serif_pro.className
        )}
      >
        Work in progress
      </h1>
      <div>
        <p className="text-center">
          I&apos;m putting the finishing touches on some exciting projects.
        </p>
        <p className="text-center">Check back soon to see what&apos;s new!</p>
      </div>
      <Link href="/">
        <MainButton>
          <ArrowLeft />
          Back to Home
        </MainButton>
      </Link>
    </div>
  );
};

export default ComingSoonPage;
