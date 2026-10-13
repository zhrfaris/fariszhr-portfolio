"use client";

import { toast } from "sonner";
import { Pen, Plus, Trash } from "lucide-react";

import { Category } from "@/actions/category/get/types";
import { deleteCategory } from "@/actions/category/delete";
import { IconAction } from "@/components/dashboard/icon-action";
import { SimpleTable } from "@/components/dashboard/simple-table";
import PopoverForm from "@/components/form/popover-form";
import { Button } from "@/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import AlertDialogWrapper from "@/components/wrappers/alert-dialog-wrapper";
import { useAction } from "@/hooks/use-action";
import CategoryForm from "./category-form";

type Row = NonNullable<Category>;

/** Categories: Name · Slug · Actions. A short list, nothing to sort, filter
 * or page through; the order isn't used on the live site, so no reordering. */
export const CategoryTable = ({ data }: { data: Row[] }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">No categories yet.</p>
        <PopoverForm title="New category" FormComponent={CategoryForm}>
          <Button>
            <Plus />
            New category
          </Button>
        </PopoverForm>
      </div>
    );
  }

  return (
    <SimpleTable
      label="Categories"
      rows={data}
      rowKey={(c) => c.id}
      template="minmax(0,1.4fr) minmax(0,1fr) 70px"
      columns={[
        {
          header: "Name",
          cell: (c) => <span className="font-medium">{c.name}</span>,
        },
        {
          header: "Slug",
          cell: (c) => c.slug,
          className: "text-muted-foreground",
        },
        { header: "Actions", cell: (c) => <ActionButtons category={c} /> },
      ]}
    />
  );
};

const ActionButtons = ({ category }: { category: Row }) => {
  const { execute: executeDelete } = useAction(deleteCategory, {
    onProceed: () => {
      toast.loading("Deleting category...", {
        id: "loading-delete-category",
      });
    },
    onSuccess: () => {
      toast.success(`category deleted!`);
    },
    onError: (error) => {
      toast.error(error);
    },
    onComplete() {
      toast.dismiss("loading-delete-category");
    },
  });

  const onDelete = () => {
    if (!category?.id) {
      toast.error("Failed to delete category");
      return;
    }
    executeDelete({ id: category.id });
  };

  return (
    <div className="flex w-[70px] items-center gap-1.5">
      {/* Popover and tooltip share the button (both triggers asChild). */}
      <Tooltip>
        <PopoverForm
          align="end"
          title="Edit category"
          FormComponent={CategoryForm}
          initialData={category}
        >
          <TooltipTrigger asChild>
            <IconAction aria-label="Edit">
              <Pen />
            </IconAction>
          </TooltipTrigger>
        </PopoverForm>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>
      <Tooltip>
        <AlertDialogWrapper
          header={`Delete Category?`}
          description={`You will permanently delete the selected Category, this action can not be undone!`}
          proceedHandler={onDelete}
        >
          <TooltipTrigger asChild>
            <IconAction aria-label="Delete" destructive>
              <Trash />
            </IconAction>
          </TooltipTrigger>
        </AlertDialogWrapper>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  );
};
