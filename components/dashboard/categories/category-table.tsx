"use client";
import { Button } from "@/components/shadcn/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/shadcn/checkbox";
import { DataTable } from "@/components/table/data-table";
import { ArrowUpDown, Pen, Trash } from "lucide-react";

import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import AlertDialogWrapper from "@/components/wrappers/alert-dialog-wrapper";

import { Category } from "@/actions/category/get/types";
import { deleteCategory } from "@/actions/category/delete";
import PopoverForm from "@/components/form/popover-form";
import CategoryForm from "./category-form";
import { deleteManyCategories } from "@/actions/category/delete-many";

export const categoryColumns: ColumnDef<NonNullable<Category>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;

      return <div className="max-w-[450px] line-clamp-2">{name}</div>;
    },
  },
  {
    accessorKey: "slug",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Slug
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const slug = row.getValue("slug") as string;

      return <div className="max-w-[450px] line-clamp-2">{slug}</div>;
    },
  },
  {
    id: "action",
    header: () => {
      return (
        <Button variant="link" className="p-0">
          Actions
        </Button>
      );
    },
    cell: ({ row }) => {
      const data = row.original;

      if (!data) return null;

      return <ActionButtons initialData={data} />;
    },
  },
];

export const CategoryTable = ({ data }: { data: NonNullable<Category>[] }) => {
  const { execute: executeDeleteMany } = useAction(deleteManyCategories, {
    onProceed: () => {
      toast.loading("Deleting selected categories...", {
        id: "loading-delete-categories",
      });
    },
    onSuccess: () => {
      toast.success(`Selected categories deleted!`);
    },
    onError: (error) => {
      toast.error(error);
    },
    onComplete() {
      toast.dismiss("loading-delete-categories");
    },
  });

  const onDeleteManyData = (data: NonNullable<Category>[]) => {
    const deleted_ids: string[] = [];
    let isSomeSkipped = false;

    for (const d of data) {
      if (!d?.id) {
        isSomeSkipped = true;
        continue;
      }

      deleted_ids.push(d?.id);
    }

    if (isSomeSkipped) {
      toast.error("Failed to delete some selected categories");
    }

    executeDeleteMany({ ids: deleted_ids });
  };

  return (
    <DataTable
      title="category"
      columns={categoryColumns}
      data={data}
      filterPlaceholder="Filter category..."
      filterKey="name"
      onDeleteManyData={onDeleteManyData}
    />
  );
};

const ActionButtons = ({
  initialData,
}: {
  initialData: NonNullable<Category>;
}) => {
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

  const onDeleteData = (data: NonNullable<Category>) => {
    if (!data?.id) {
      toast.error("Failed to delete workplace");
      return;
    }

    executeDelete({ id: data?.id });
  };

  return (
    <div className="flex gap-4 items-center">
      <PopoverForm
        align="end"
        title="Edit Category"
        FormComponent={CategoryForm}
        initialData={initialData}
      >
        <Button
          size="icon"
          variant="outline"
          className="hover:text-primary-foreground hover:bg-primary"
        >
          <Pen className="h-4 w-4" />
        </Button>
      </PopoverForm>
      <AlertDialogWrapper
        header={`Delete Workplace?`}
        description={`You will permanently delete the selected Workplace, this action can not be undone!`}
        proceedHandler={() => onDeleteData(initialData)}
      >
        <Button
          size="icon"
          variant="outline"
          className="hover:text-destructive-foreground hover:bg-destructive"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogWrapper>
    </div>
  );
};
