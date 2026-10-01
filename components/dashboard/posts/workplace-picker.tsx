"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageType } from "@prisma/client";
import { ImageIcon, Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import {
  getWorkplacesForPicker,
  WorkplacePickerItem,
} from "@/actions/workplace/get-with-image";
import { createWorkplace } from "@/actions/workplace/create";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { cn } from "@/lib/utils";
import {
  CATEGORY_ROW_TEXT,
  TITLE_HEADER_ROW,
  WORKPLACE_LOGO,
} from "@/components/portfolio-detail/portfolio-styles";
import { useMediaUpload } from "./use-media-upload";
import { UploadProgressBadge } from "./upload-overlay";

interface WorkplacePickerProps {
  value: WorkplacePickerItem | null;
  onChange: (workplace: WorkplacePickerItem | null) => void;
  categories: { id: string; name: string }[];
  error?: string;
}

/**
 * Content-tab workplace ("company logo") picker: search existing workplaces or
 * create a new one inline (name + logo). When selected it renders the logo +
 * categories row exactly like the live case-study page.
 */
export default function WorkplacePicker({
  value,
  onChange,
  categories,
  error,
}: WorkplacePickerProps) {
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
    <div className="relative inline-block" ref={wrapRef}>
      {value ? (
        <div className={TITLE_HEADER_ROW}>
          <div className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.image.img_url}
              alt={value.name}
              className={cn(WORKPLACE_LOGO, "cursor-pointer")}
              onClick={() => setOpen((o) => !o)}
            />
            <div className="absolute -right-2 -top-2 hidden items-center gap-1 group-hover:flex">
              <button
                type="button"
                aria-label="Remove workplace"
                onClick={() => onChange(null)}
                className="rounded-full border bg-background p-0.5 text-muted-foreground shadow-sm hover:text-destructive"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
          <h4 className={CATEGORY_ROW_TEXT}>
            {categories.map((c) => c.name).join(" - ")}
          </h4>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        >
          <ImageIcon className="size-5" />
          <span className="text-sm">Add company logo</span>
        </button>
      )}

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-lg border bg-popover p-2 shadow-lg">
          {!creating ? (
            <>
              <div className="flex items-center gap-2 rounded-md border px-2">
                <Search className="size-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search workplaces…"
                  className="h-9 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              <div className="mt-2 max-h-56 space-y-1 overflow-auto">
                {filtered.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => select(w)}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm hover:bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={w.image.img_url}
                      alt=""
                      className="h-6 w-10 object-contain"
                    />
                    <span className="truncate">{w.name}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="px-2 py-3 text-sm text-muted-foreground">
                    No workplaces found.
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => {
                  setCreating(true);
                  setNewName(query);
                }}
              >
                <Plus className="size-4" />
                Create new workplace
              </Button>
            </>
          ) : (
            <div className="space-y-3 p-1">
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
