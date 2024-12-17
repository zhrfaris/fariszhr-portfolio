"use client";
import { Button } from "@/components/shadcn/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/shadcn/checkbox";
import { DataTable } from "@/components/table/data-table";
import { ArrowUpDown, ExternalLink, Pen, Trash } from "lucide-react";

import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import Link from "next/link";
import AlertDialogWrapper from "@/components/wrappers/alert-dialog-wrapper";

import { Workplace } from "@/actions/workplace/get/types";
import { deleteManyWorkplaces } from "@/actions/workplace/delete-many";
import { deleteWorkplace } from "@/actions/workplace/delete";
import Image from "next/image";

export const workplaceColumns: ColumnDef<NonNullable<Workplace>>[] = [
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
    id: "image",
    accessorKey: "image.img_url_thumbnail",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Image
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const image = row.getValue("image") as string;

      return (
        <div className="max-w-[450px]">
          <Image src={image} alt="" width={100} height={100} />
        </div>
      );
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

export const WorkplaceTable = ({
  data,
}: {
  data: NonNullable<Workplace>[];
}) => {
  const { execute: executeDeleteMany } = useAction(deleteManyWorkplaces, {
    onProceed: () => {
      toast.loading("Deleting selected workplaces...", {
        id: "loading-delete-workplaces",
      });
    },
    onSuccess: () => {
      toast.success(`Selected workplaces deleted!`);
    },
    onError: (error) => {
      toast.error(error);
    },
    onComplete() {
      toast.dismiss("loading-delete-workplaces");
    },
  });

  const onDeleteManyData = (data: NonNullable<Workplace>[]) => {
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
      toast.error("Failed to delete some selected workplaces");
    }

    executeDeleteMany({ ids: deleted_ids });
  };

  return (
    <DataTable
      title="workplace"
      columns={workplaceColumns}
      data={data}
      filterPlaceholder="Filter workplace..."
      filterKey="name"
      onDeleteManyData={onDeleteManyData}
    />
  );
};

const ActionButtons = ({
  initialData,
}: {
  initialData: NonNullable<Workplace>;
}) => {
  const { execute: executeDelete } = useAction(deleteWorkplace, {
    onProceed: () => {
      toast.loading("Deleting workplace...", {
        id: "loading-delete-workplace",
      });
    },
    onSuccess: () => {
      toast.success(`workplace deleted!`);
    },
    onError: (error) => {
      toast.error(error);
    },
    onComplete() {
      toast.dismiss("loading-delete-workplace");
    },
  });

  const onDeleteData = (data: NonNullable<Workplace>) => {
    if (!data?.id) {
      toast.error("Failed to delete workplace");
      return;
    }

    executeDelete({ id: data?.id });
  };

  return (
    <div className="flex gap-4 items-center">
      {initialData?.url && (
        <Link href={initialData?.url} target="_blank">
          <Button
            size="icon"
            variant="outline"
            className="hover:text-primary-foreground hover:bg-primary"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      )}
      <Link href={`/dashboard/workplaces/${initialData?.slug}/edit`}>
        <Button
          size="icon"
          variant="outline"
          className="hover:text-primary-foreground hover:bg-primary"
        >
          <Pen className="h-4 w-4" />
        </Button>
      </Link>
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
