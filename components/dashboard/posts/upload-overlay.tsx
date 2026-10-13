"use client";

import { AlertCircle, Loader2, RotateCw, X } from "lucide-react";
import { Button } from "@/components/shadcn/button";

/** Circular determinate progress ring, mirroring the block editor's uploader. */
export const CircularProgress = ({ value }: { value: number }) => {
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" className="shrink-0">
      <circle
        cx="17"
        cy="17"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="3"
      />
      <circle
        cx="17"
        cy="17"
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 17 17)"
        style={{ transition: "stroke-dashoffset 0.15s ease" }}
      />
    </svg>
  );
};

/** Bottom-right progress / processing pill shown over an uploading preview. */
export const UploadProgressBadge = ({
  status,
  progress,
}: {
  status?: string;
  progress: number;
}) => (
  <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-sm bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
    {status === "processing" ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Processing…</span>
      </>
    ) : (
      <>
        <CircularProgress value={progress} />
        <span>{progress}%</span>
      </>
    )}
  </div>
);

/** Full-cover error overlay with retry / remove, matching the editor. */
export const UploadErrorOverlay = ({
  message,
  onRetry,
  onRemove,
}: {
  message?: string;
  onRetry: () => void;
  onRemove: () => void;
}) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-4 text-center text-white">
    <AlertCircle className="h-6 w-6 text-destructive" />
    <p className="max-w-md text-sm">{message ?? "Upload failed"}</p>
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={onRetry}
      >
        <RotateCw />
        Retry
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="text-destructive hover:text-destructive"
        onClick={onRemove}
      >
        <X />
        Remove
      </Button>
    </div>
  </div>
);
