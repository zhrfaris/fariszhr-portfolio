"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Image as ImageType } from "@prisma/client";
import { Check, ChevronDown, ImageIcon, Loader2, Plus, X } from "lucide-react";
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
import { fieldDropdown } from "./field-dropdown";

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
        <Label>Company</Label>
        <div className="relative" ref={wrapRef}>
          {/* Same field + attached panel as Category: while open, the field
              itself takes the search text. */}
          {open && !creating ? (
            <div
              className={cn(fieldDropdown.trigger, fieldDropdown.open, "px-3")}
            >
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
                placeholder={value?.name ?? "Search company"}
                aria-label="Search company"
                className={fieldDropdown.input}
              />
              <ChevronDown aria-hidden className={fieldDropdown.chevron} />
            </div>
          ) : (
            <button
              ref={ref}
              type="button"
              onClick={() => setOpen((o) => !o)}
              className={cn(
                fieldDropdown.trigger,
                "px-3",
                open && fieldDropdown.open,
                error && "border-destructive"
              )}
            >
              {value ? (
                <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <span className="truncate">{value.name}</span>
                  <WorkplaceLogo workplace={value} />
                </span>
              ) : (
                <span className={cn("flex-1", fieldDropdown.placeholder)}>
                  Select company
                </span>
              )}
              <ChevronDown aria-hidden className={fieldDropdown.chevron} />
            </button>
          )}

          {open && (
            <div className={fieldDropdown.panel}>
              {!creating ? (
                <>
                  <div className="max-h-56 overflow-auto py-1">
                    {filtered.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => select(w)}
                        className={fieldDropdown.item}
                      >
                        <span className="truncate">{w.name}</span>
                        <span className="flex shrink-0 items-center gap-3">
                          <WorkplaceLogo workplace={w} />
                          <Check
                            aria-hidden
                            className={cn(
                              "size-4 text-primary",
                              value?.id !== w.id && "invisible"
                            )}
                          />
                        </span>
                      </button>
                    ))}
                    {filtered.length === 0 && (
                      <p className={cn(fieldDropdown.hint, "px-3 py-2")}>
                        No companies found.
                      </p>
                    )}
                  </div>
                  <div className="border-t p-1">
                    <button
                      type="button"
                      className={cn(
                        fieldDropdown.item,
                        "justify-start gap-2 rounded-sm text-primary"
                      )}
                      onClick={() => {
                        setCreating(true);
                        setNewName(query);
                      }}
                    >
                      <Plus className="size-4" />
                      Create new workplace
                    </button>
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
                      onClick={() => setCreating(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
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
        "relative flex h-24 items-center justify-center rounded-md border border-dashed bg-muted text-xs text-muted-foreground",
        !logo && "cursor-pointer hover:bg-secondary"
      )}
    >
      {upload.isUploading ? (
        <UploadProgressBadge
          status={upload.status}
          progress={upload.progress}
        />
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
            className="absolute right-1 top-1 rounded-sm border bg-background p-0.5 hover:text-destructive"
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
