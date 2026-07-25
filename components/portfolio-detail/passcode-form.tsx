"use client";

import { User } from "@/actions/user/get/type";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useState, useTransition } from "react";
import MainButton from "../common/main-button";
import { Loader, MoveRight } from "lucide-react";
import { verifyPostPasscode } from "@/actions/post/get";

const PasscodeForm = ({ user, slug }: { user: User; slug: string }) => {
  const email = user?.email || "fariszhr.studio@gmail.com";

  const [passcode, setPasscode] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await verifyPostPasscode(slug, formData);
      if (!result.success) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
      } else {
        window.location.reload();
      }
    });
  };

  const handleClear = () => {
    setPasscode("");
    setIsShaking(false);
    inputRef.current?.focus();
  };

  return (
    <div className="rounded-3xl bg-white shadow-2xl w-full max-w-[420px]">
      <div className="p-8 space-y-4">
        <div className="space-y-2">
          <h2
            className="font-semibold text-xl"
          >
            This one&apos;s behind a password
          </h2>
          <p className="text-muted-foreground text-xs">
            It covers confidential details, so the full case study is protected.
            Email{" "}
            <Link
              href={`mailto:${email}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {email}
            </Link>{" "}
            to get access.
          </p>
        </div>
        <form action={handleSubmit} className="flex items-center gap-2">
          <div
            className={cn(
              "relative flex items-center flex-1 md:min-w-[280px]",
            )}
          >
            <input
              ref={inputRef}
              type="password"
              id="passcode"
              name="passcode"
              placeholder="Enter password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              disabled={isPending}
              className={cn(
                "h-[44px] w-full rounded-full py-2 pl-4 pr-4 border text-sm outline-none transition-colors focus:border-foreground",
                passcode.length > 0
                  ? "border-foreground pr-14"
                  : "border-input",
                isShaking && "animate-wiggle border-red-500 text-red-500 focus:border-red-500",
              )}
            />
            {passcode.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <MainButton rounded={true} type="submit">
            {isPending ? (
              <Loader className="!size-6 animate-spin" />
            ) : (
              <MoveRight className="!size-6" />
            )}
          </MainButton>
        </form>
      </div>
    </div>
  );
};

export default PasscodeForm;
