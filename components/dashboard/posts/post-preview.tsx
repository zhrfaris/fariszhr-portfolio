"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Monitor, Smartphone } from "lucide-react";

import { Portfolio } from "@/actions/post/get/types";
import PortfolioDetail from "@/components/portfolio-detail/portfolio-detail";
import LenisProvider from "@/components/utils/providers/lenis-provider";
import {
  PostPreviewData,
  mergePreview,
  previewChannelName,
  previewStorageKey,
  readPreview,
} from "@/lib/post-preview";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";

type Device = "desktop" | "mobile";

/** Width of the Mobile frame (an iPhone-class viewport). */
const MOBILE_WIDTH = 390;

interface PostPreviewProps {
  savedPost: NonNullable<Portfolio>;
  isFrame: boolean;
  header: React.ReactNode;
}

/** Re-reads the editor's hand-off whenever the editor sends an update. */
function useEditorPreview(postId: string) {
  const [data, setData] = useState<PostPreviewData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = () => setData(readPreview(postId));
    load();
    setReady(true);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(previewChannelName(postId));
      channel.onmessage = load;
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === previewStorageKey(postId)) load();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      channel?.close();
      window.removeEventListener("storage", onStorage);
    };
  }, [postId]);

  return { data, ready };
}

const PostPreview = ({ savedPost, isFrame, header }: PostPreviewProps) => {
  const { data, ready } = useEditorPreview(savedPost.id);
  const [device, setDevice] = useState<Device>("desktop");

  // Wait for localStorage so the saved version doesn't flash first.
  if (!ready) return null;

  const post = mergePreview(savedPost, data);

  // Exactly what the public /portfolios/[slug] page renders.
  const page = (
    <LenisProvider>
      <main>
        {header}
        <PortfolioDetail post={post} />
      </main>
    </LenisProvider>
  );

  if (isFrame) return page;

  return (
    <>
      {device === "desktop" ? (
        // Bottom padding keeps the toolbar off the last content; the public
        // page's "Back to the top" button is lifted above the toolbar.
        <div
          className={cn(
            // 88px = 24px offset + 40px toolbar + 24px air.
            "pb-[88px]",
            "[&_div:has(>.back-to-top-btn)]:bottom-[88px]"
          )}
        >
          {page}
        </div>
      ) : (
        // A real iframe so the page sees a 390px viewport and its CSS
        // breakpoints switch to the mobile layout.
        <div className="flex min-h-screen justify-center bg-neutral-200 px-4 pb-[88px] pt-6">
          <iframe
            title="Mobile preview"
            src={`/dashboard/posts/${savedPost.slug}/preview?frame=1`}
            style={{ width: MOBILE_WIDTH }}
            className="h-[calc(100vh-112px)] max-w-full shrink-0 rounded-[28px] border border-neutral-300 bg-white shadow-xl"
          />
        </div>
      )}
      <PreviewToolbar
        slug={savedPost.slug}
        device={device}
        onDeviceChange={setDevice}
        isSavedVersion={!data}
      />
    </>
  );
};

const FLOAT_SHADOW = "shadow-[0_4px_16px_rgba(0,0,0,0.08)]";

const DEVICES = [
  { value: "desktop", Icon: Monitor, label: "Desktop" },
  { value: "mobile", Icon: Smartphone, label: "Mobile" },
] as const;

function PreviewToolbar({
  slug,
  device,
  onDeviceChange,
  isSavedVersion,
}: {
  slug: string;
  device: Device;
  onDeviceChange: (device: Device) => void;
  isSavedVersion: boolean;
}) {
  const editorHref = `/dashboard/posts/${slug}/edit`;

  const backToEditor = (e: React.MouseEvent) => {
    // Opened from the editor: close this tab and land back on the editor
    // with its unsaved changes intact. Otherwise follow the link.
    if (window.opener && !window.opener.closed) {
      e.preventDefault();
      window.close();
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Preview"
      // w-max: a fixed box at left:50% would otherwise only get half the
      // viewport to lay out in and push the badge off-screen on phones.
      className="fixed bottom-6 left-1/2 z-[60] flex w-max -translate-x-1/2 items-center gap-3"
    >
      {/* 1. Back */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={editorHref}
              onClick={backToEditor}
              aria-label="Back to editor"
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#404040] transition-colors hover:bg-[#FAFAFA]",
                FLOAT_SHADOW
              )}
            >
              <ArrowLeft className="size-5" />
            </a>
          </TooltipTrigger>
          <TooltipContent side="top">Back to editor</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 2. Desktop / Mobile — equal-width segments, so the active pill
          slides by exactly one segment. */}
      <div
        className={cn(
          "relative grid h-10 shrink-0 grid-cols-2 rounded-full border border-[#E5E5E5] bg-[#F3F3F3] p-1",
          FLOAT_SHADOW
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-[#404040] transition-transform duration-200 ease-in-out",
            device === "mobile" && "translate-x-full"
          )}
        />
        {DEVICES.map(({ value, Icon, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={device === value}
            aria-label={label}
            onClick={() => onDeviceChange(value)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors duration-200",
              device === value
                ? "text-white"
                : "text-[#757575] hover:text-[#404040]"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="max-[479px]:hidden">{label}</span>
          </button>
        ))}
      </div>

      {/* 3. Status */}
      <span
        className={cn(
          "flex h-10 shrink-0 items-center whitespace-nowrap rounded-full border border-[#E0951A] bg-[#F5A623] px-4 text-sm font-semibold text-white",
          FLOAT_SHADOW
        )}
        title={
          isSavedVersion
            ? "No unsaved changes found — showing the last saved version"
            : undefined
        }
      >
        Not yet published
      </span>
    </div>
  );
}

export default PostPreview;
