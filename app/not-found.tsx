import { Button } from "@/components/shadcn/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className="min-h-screen grid place-items-center pb-[20vh]">
      <div className="flex flex-col lg:flex-row items-center justify-center lg:gap-12 max-w-screen-xl px-6">
        <Image
          src="/oh_no.png"
          className="scale-75 lg:scale-100 border border-[#00000030]"
          style={{
            borderRadius: "50%",
          }}
          alt="not-found image"
          width={250}
          height={250}
        />
        <div className="flex flex-col items-center lg:items-start">
          <h1 className="hidden lg:block text-8xl font-bold">404</h1>
          <h2 className="text-3xl font-bold">Oops, nothing here...</h2>
          <p className="font-semibold text-center lg:text-left">
            Uh Oh. The page you were looking for does not exist, let&apos;s go
            back to home, shall we?
          </p>
          <Link href="/">
            <Button className="rounded-full mt-6">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
