"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";

import { cn } from "@/lib/utils";
import { SlashCommandItem } from "./slash-command";

export interface SlashMenuRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const SlashMenu = forwardRef<SlashMenuRef, SuggestionProps<SlashCommandItem>>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [props.items]);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) props.command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex(
            (selectedIndex + props.items.length - 1) % props.items.length
          );
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % props.items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (props.items.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-float">
          No results
        </div>
      );
    }

    return (
      <div className="z-50 max-h-80 w-64 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-float">
        {props.items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onMouseEnter={() => setSelectedIndex(index)}
              onMouseDown={(e) => {
                e.preventDefault();
                selectItem(index);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded px-2 py-1.5 text-left text-sm transition-colors",
                index === selectedIndex ? "bg-secondary" : "hover:bg-secondary"
              )}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded border border-border bg-background">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }
);

SlashMenu.displayName = "SlashMenu";

export default SlashMenu;
