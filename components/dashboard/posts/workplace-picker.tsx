"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Image as ImageType } from "@prisma/client";
import { ImageIcon, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  getWorkplacesForPicker,
  WorkplacePickerItem,
} from "@/actions/workplace/get-with-image";
import { createWorkplace } from "@/actions/workplace/create";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { cn } from "@/lib/utils";
import { useMediaUpload } from "./use-media-upload";
import { UploadProgressBadge } from "./upload-overlay";

interface WorkplacePickerProps {
  value: WorkplacePickerItem | null;
  onChange: (workplace: WorkplacePickerItem | null) => void;
  error?: string;
}

/**
 * "Company" field: a select-style trigger showing the chosen workplace's name
 * and logo. Opening it reveals a search box over a name + logo list, plus an
 * inline "create new workplace" form (name + logo). Deleting workplaces lives
 * on the Workplaces page only.
 */
const WorkplacePicker = forwardRef<HTMLButtonElement, WorkplacePickerProps>(
  function WorkplacePicker({ value, onChange, error }, ref) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<WorkplacePickerItem[]>([]);
    const [query, setQuery] = useState("");
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newLogo, setNewLogo] = useState<ImageType | null>(null);
    const [saving, setSaving] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    const logoUpload = useMediaUpload((img) => setNewLogo(img));

    useEffect(() => {
      let active = true;
      getWorkplacesForPicker().then((res) => {
        if (active) setItems(res);
      });
      return () => {
        active = false;
      };
    }, []);

    useEffect(() => {
      const onDown = (e: MouseEvent) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
          setOpen(false);
          setCreating(false);
        }
      };
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }, []);

    const filtered = items.filter((w) =>
      w.name.toLowerCase().includes(query.trim().toLowerCase())
    );

    const select = (wp: WorkplacePickerItem) => {
      onChange(wp);
      setOpen(false);
      setQuery("");
    };

    const create = async () => {
      const name = newName.trim();
      if (!name || !newLogo || saving) return;
      setSaving(true);
      const res = await createWorkplace({ name, image: newLogo });
      setSaving(false);
      if (res?.data) {
        const wp = { id: res.data.id, name: res.data.name, image: newLogo };
        setItems((prev) => [...prev, wp]);
        select(wp);
        setCreating(false);
        setNewName("");
        setNewLogo(null);
      } else {
        toast.error(res?.error ?? "Failed to create workplace");
      }
    };

    return (
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Company</Label>
        <div className="relative" ref={wrapRef}>
          <button
            ref={ref}
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "flex h-9 w-full items-center justify-between gap-3 rounded-md border border-input bg-background px-3 text-left text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring",
              error && "border-destructive"
            )}
          >
            {value ? (
              <>
                <span className="truncate text-xs">{value.name}</span>
                <WorkplaceLogo workplace={value} />
              </>
            ) : (
              <span className="text-muted-foreground">Select company</span>
            )}
          </button>

          {open && (
            <div className="absolute inset-x-0 top-0 z-30 overflow-hidden rounded-md border border-foreground/80 bg-popover shadow-lg">
              {!creating ? (
                <>
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setOpen(false);
                      if (e.key === "Enter" && filtered.length === 1) {
                        e.preventDefault();
                        select(filtered[0]);
                      }
                    }}
                    placeholder="Search company"
                    className="h-[27px] w-full border-b bg-muted/40 px-3 text-sm outline-none"
                  />
                  <div className="max-h-56 overflow-auto py-1">
                    {filtered.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => select(w)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs hover:bg-muted",
                          value?.id === w.id && "bg-muted"
                        )}
                      >
                        <span className="truncate">{w.name}</span>
                        <WorkplaceLogo workplace={w} />
                      </button>
                    ))}
                    {filtered.length === 0 && (
                      <p className="px-3 py-2 text-xs text-muted-foreground">
                        No companies found.
                      </p>
                    )}
                  </div>
                  <div className="border-t p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setCreating(true);
                        setNewName(query);
                      }}
                    >
                      <Plus className="size-4" />
                      Create new workplace
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3 p-3">
                  <Input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Workplace name"
                  />
                  <LogoDropzone
                    logo={newLogo}
                    upload={logoUpload}
                    onClear={() => setNewLogo(null)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCreating(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!newName.trim() || !newLogo || saving}
                      onClick={() => void create()}
                    >
                      {saving && <Loader2 className="size-4 animate-spin" />}
                      Create
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

function WorkplaceLogo({ workplace }: { workplace: WorkplacePickerItem }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={workplace.image.img_url}
      alt={workplace.name}
      className="h-4 max-w-[96px] shrink-0 object-contain object-right"
    />
  );
}

function LogoDropzone({
  logo,
  upload,
  onClear,
}: {
  logo: ImageType | null;
  upload: ReturnType<typeof useMediaUpload>;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => !logo && inputRef.current?.click()}
      className={cn(
        "relative flex h-24 items-center justify-center rounded-md border border-dashed bg-muted/40 text-xs text-muted-foreground",
        !logo && "cursor-pointer hover:bg-muted"
      )}
    >
      {upload.isUploading ? (
        <UploadProgressBadge status={upload.status} progress={upload.progress} />
      ) : logo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.img_url}
            alt=""
            className="max-h-20 max-w-[70%] object-contain"
          />
          <button
            type="button"
            aria-label="Remove logo"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute right-1 top-1 rounded-full border bg-background p-0.5 hover:text-destructive"
          >
            <X className="size-3.5" />
          </button>
        </>
      ) : (
        <span className="flex items-center gap-1">
          <ImageIcon className="size-4" /> Upload logo
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.svg,image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload.start(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export default WorkplacePicker;
