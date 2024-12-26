"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/command";
import { PlusCircle, XCircle } from "lucide-react";
import { Label } from "@/components/shadcn/label";
import { Action } from "@/hooks/use-action";
import { useFormCombobox } from "./use-form-combobox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/shadcn/sheet";
import { Button } from "@/components/shadcn/button";
import { cn, replaceHTMLTagFromString } from "@/lib/utils";
import styles from "./form-combobox.module.scss";

/**
 * @param id: id dari TData
 * @param parentId: id dari Schema Form.
 *
 * * semisal combobox dipakai di form Member, untuk assign data publication
 * * maka id adalah id dari publication, dan
 * * parent id adalah id dari member
 */
export interface UnassignInput {
  id: string;
  parentId: string;
}

export interface FormCreateComponentOnComboboxProps {
  onSuccess?: (newly_data_id: string) => void;
  essential?: boolean;
}

export interface FormComboboxBaseData {
  id: string;
  slug: string;
  option_name: string;
  option_description?: string;
}

/**
 * Type dari Property Component Combobox Form
 *
 * * TData: adalah tipe data yang akan ditampilkan di combobox ini
 *
 * @param getData: Action untuk ambil list semua TData yang ada di database
 * @param onUpdateSelected: function yang akan dipanggil ketika ada perubahan pada list selected
 * @param onUnassign: Action yang akan dipanggil ketika ada selected item yang di unassign
 * @param FormCreateComponent: React Component yang akan ditampilkan sebagai form di side sheet
 *
 * optionals
 * @param parentId: id dari Schema Form. jika combobox dipanggil dari form Member, maka parentId adalah id Member
 * @param initialSelected: list selected yang sudah ada dari parent data jika.
 * @param label: label dari combobox.
 * @param disabled: disabled dari combobox.
 * @param placeholder: placeholder dari combobox.
 */
interface FormComboboxProps<TData extends FormComboboxBaseData> {
  getData: Action<object, TData[]>;
  onUpdateSelected: (selected: string[]) => void;
  onUnassign: Action<UnassignInput, { message: string }>;
  FormCreateComponent: React.ComponentType<FormCreateComponentOnComboboxProps>;

  label?: string;
  parentId?: string;
  disabled?: boolean;
  placeholder?: string;
  sideSheetWidth?: "sm" | "md" | "lg" | "full";
  initialSelected?: string[];
  selectedChipMode?: "chip" | "list";
  className?: string;
}

function FormCombobox<TData extends FormComboboxBaseData>({
  label,
  disabled,
  parentId,
  FormCreateComponent,
  initialSelected = [],
  sideSheetWidth = "lg",
  placeholder = "search...",
  selectedChipMode = "list",
  className,
  getData,
  onUnassign,
  onUpdateSelected,
}: FormComboboxProps<TData>) {
  const {
    listOption,
    isFirstLoad,
    searchValue,
    listSelected,
    isLoadingData,
    isSideFormShown,
    openSheet,
    onDeleteData,
    setSearchValue,
    onKeyupHandler,
    onSelectHandler,
    successCreateNew,
    setIsSideFormShown,
  } = useFormCombobox({
    parentId,
    initialSelected,
    getData,
    onUnassign,
    onUpdateSelected,
  });

  const renderCommandComponent = () => (
    <div className="relative w-full px-2 max-w-[780px]">
      <Button
        type="button"
        onClick={openSheet}
        size="icon"
        variant="ghost"
        className="absolute right-0 inset-y-0 w-fit h-full my-auto flex items-center justify-center px-4 hover:bg-transparent hover:text-black"
      >
        <PlusCircle className="size-5" />
      </Button>
      <Command className="bg-muted">
        <CommandInput
          value={searchValue}
          disabled={disabled || isFirstLoad || isLoadingData}
          onKeyUp={onKeyupHandler}
          placeholder={
            isFirstLoad || isLoadingData ? "Loading Data..." : placeholder
          }
          onValueChange={(search) => setSearchValue(search)}
          className="border-none h-9 px-4 bg-muted text-base rounded-none"
        />
        {searchValue !== "" && (
          <div className="absolute top-10 inset-x-0 w-full h-fit rounded-lg overflow-hidden z-20">
            <CommandList className="bg-muted text-base">
              {!listSelected.some((item) => item.slug === searchValue) &&
                searchValue?.length >= 3 && (
                  <CommandEmpty className="p-4 text-sm text-left">
                    Not found, press <code onClick={openSheet}>Enter</code> to
                    create &quot;
                    {searchValue}&quot; as {label}
                  </CommandEmpty>
                )}
              <CommandGroup className="bg-muted text-base">
                {listOption.map((d) => (
                  <CommandItem
                    className="border aria-selected:border-black/10 border-transparent aria-selected:text-foreground text-foreground/60 cursor-pointer"
                    key={d.id}
                    value={d.slug}
                    onSelect={() => onSelectHandler(d)}
                  >
                    <div className="flex flex-col space-y-2">
                      <span className="font-semibold">{d.option_name}</span>
                      {d.option_description && (
                        <span className="max-h-[125px] line-clamp-[2] text-sm">
                          {replaceHTMLTagFromString(d.option_description, 350)}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );

  const renderSelectedComponent = () => (
    <ul
      className={cn(
        "items-stretch gap-2 text-sm px-2 py-4",
        selectedChipMode === "chip" && "flex flex-wrap",
        selectedChipMode === "list" && "grid grid-cols-1 @md:grid-cols-2"
      )}
    >
      {listSelected.map((data) => (
        <li
          key={data.id}
          className={cn(
            "flex items-start justify-between gap-4 bg-background rounded-lg py-2 px-3 border border-foreground/30",
            selectedChipMode === "chip" && "w-fit",
            selectedChipMode === "list" && "w-full"
          )}
        >
          <div className="flex flex-col space-y-2 flex-1">
            <span className="font-semibold">{data.option_name}</span>
            {data.option_description && (
              <span className="max-h-[125px] line-clamp-[2] text-sm">
                {replaceHTMLTagFromString(data.option_description, 350)}
              </span>
            )}
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="w-fit h-fit hover:bg-transparent hover:text-black"
            onClick={() => onDeleteData(data)}
          >
            <XCircle className="text-foreground cursor-pointer size-5" />
          </Button>
        </li>
      ))}
    </ul>
  );

  const renderSheetComponent = () => {
    return (
      <Sheet
        open={isSideFormShown}
        onOpenChange={(open) => setIsSideFormShown(open)}
      >
        <SheetContent
          zIndex={5}
          className={cn(
            "overflow-y-auto",
            styles.sideSheetContent,
            sideSheetWidth === "sm" && styles.sm,
            sideSheetWidth === "md" && styles.md,
            sideSheetWidth === "lg" && styles.lg,
            sideSheetWidth === "full" && styles.full
          )}
        >
          <SheetHeader>
            <SheetTitle>Create New {label}</SheetTitle>
            <SheetDescription>
              Create to your {label} here. Click save when youre done.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <FormCreateComponent
              onSuccess={successCreateNew}
              essential={true}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <div className="space-y-2 @container">
      {label && (
        <Label className="text-sm font-semibold text-foreground/70">
          {label}
        </Label>
      )}
      <div
        className={cn(
          "border border-input rounded-lg bg-muted",
          listSelected.length > 0 && "pt-2",
          className
        )}
      >
        {renderCommandComponent()}
        {listSelected.length > 0 && renderSelectedComponent()}
      </div>
      {renderSheetComponent()}
    </div>
  );
}

export default FormCombobox;
