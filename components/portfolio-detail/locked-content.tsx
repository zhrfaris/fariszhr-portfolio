import React from "react";

/*
 * Stand-in for a locked case study's Content: fake skeleton lines (never the
 * real text), blurred, with the password modal on top. Widths are fixed so
 * the server and client render the same thing.
 */
type Block =
  | { kind: "heading"; lines: number[] }
  | { kind: "text"; lines: number[] }
  | { kind: "image" };

const BLOCKS: Block[] = [
  { kind: "heading", lines: [92, 64] },
  { kind: "text", lines: [100, 96, 98, 88, 72] },
  { kind: "heading", lines: [] },
  { kind: "text", lines: [100, 94, 97, 60] },
  { kind: "image" },
  { kind: "heading", lines: [] },
  { kind: "text", lines: [98, 100, 91, 84, 45] },
];

const LockedContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative md:pt-2">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none space-y-6 blur-[6px]"
      >
        {BLOCKS.map((block, i) => {
          if (block.kind === "image")
            return (
              <div key={i} className="h-56 w-full rounded-3xl bg-neutral-200" />
            );
          if (block.kind === "heading")
            return (
              <div key={i} className="space-y-3">
                <div className="h-6 w-2/5 rounded-full bg-neutral-300" />
                {block.lines.map((w, j) => (
                  <div
                    key={j}
                    className="h-4 rounded-full bg-neutral-200"
                    style={{ width: `${w * 0.5}%` }}
                  />
                ))}
              </div>
            );
          return (
            <div key={i} className="space-y-3">
              {block.lines.map((w, j) => (
                <div
                  key={j}
                  className="h-4 rounded-full bg-neutral-200"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Fade the skeleton out at the bottom so it doesn't end abruptly. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />

      <div className="absolute inset-x-0 top-16 flex justify-center px-0 md:top-24">
        {children}
      </div>
    </div>
  );
};

export default LockedContent;
