"use client";

import { User } from "@/actions/user/get/type";
import { source_serif_pro } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { useState, useTransition } from "react";
import MainButton from "../common/main-button";
import { Loader, MoveRight } from "lucide-react";
import { verifyPostPasscode } from "@/actions/post/get";

const PasscodeForm = ({ user, slug }: { user: User; slug: string }) => {
  const email = user?.email || "fariszhr.studio@gmail.com";

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      const result = await verifyPostPasscode(slug, formData);
      if (!result.success) {
        setError(result.error || "Something went wrong");
      } else {
        // Refresh the current server component route to recognize the newly set cookie
        window.location.reload();
      }
    });
  };

  return (
    <div className="rounded-3xl bg-white shadow-2xl w-full max-w-[420px]">
      <div className="p-8 space-y-4">
        <div className="space-y-2">
          <h2
            className={cn(source_serif_pro.className, "font-semibold text-xl")}
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
          <input
            type="password"
            id="passcode"
            name="passcode"
            placeholder="Enter password"
            disabled={isPending}
            className="h-[44px] rounded-full py-2 px-4 border border-input text-sm md:min-w-[280px]"
          />
          <MainButton rounded={true} disabled={isPending} type="submit">
            {isPending ? (
              <Loader className="!size-6 animate-spin" />
            ) : (
              <MoveRight className="!size-6" />
            )}
          </MainButton>
        </form>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default PasscodeForm;
