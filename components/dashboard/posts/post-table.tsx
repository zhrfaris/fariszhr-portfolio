"use client";
import { Button } from "@/components/shadcn/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/shadcn/checkbox";
import { DataTable } from "@/components/table/data-table";
import { ArrowUpDown, Pen, SquareArrowOutUpRight, Trash } from "lucide-react";

import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import Link from "next/link";
import AlertDialogWrapper from "@/components/wrappers/alert-dialog-wrapper";

import { Workplace } from "@/actions/workplace/get/types";
import { Post } from "@/actions/post/get/types";
import { capitalizeEachWord, cn } from "@/lib/utils";
import { Category } from "@/actions/category/get/types";
import { deletePost } from "@/actions/post/delete";
import { deleteManyPosts } from "@/actions/post/delete-many";
import { Status } from "@/actions/types";

export const postColumns: ColumnDef<NonNullable<Post>>[] = [
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
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string;

      return <div className="max-w-[450px] line-clamp-2">{title}</div>;
    },
  },
  {
    accessorKey: "excerpt",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Excerpt
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const excerpt = row.getValue("excerpt") as string;

      return (
        <div className="max-w-[450px]">
          <p>{excerpt}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "categories",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Categories
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const categories = row.getValue("categories") as NonNullable<Category>[];

      return (
        <div className="max-w-[450px]">
          <p>{categories?.map((c) => c.name).join(", ")}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "workplace",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Workplace
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const workplace = row.getValue("workplace") as NonNullable<Workplace>;

      return (
        <div className="max-w-[450px]">
          <p>{capitalizeEachWord(workplace?.name)}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="link"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <div className="max-w-[450px]">
          <p
            className={cn(
              "font-bold",
              status === Status.Values.ACTIVE
                ? "text-green-500"
                : "text-red-500"
            )}
          >
            {capitalizeEachWord(status)}
          </p>
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

export const PostTable = ({ data }: { data: NonNullable<Post>[] }) => {
  const { execute: executeDeleteMany } = useAction(deleteManyPosts, {
    onProceed: () => {
      toast.loading("Deleting selected posts...", {
        id: "loading-delete-posts",
      });
    },
    onSuccess: () => {
      toast.success(`Selected posts deleted!`);
    },
    onError: (error) => {
      toast.error(error);
    },
    onComplete() {
      toast.dismiss("loading-delete-posts");
    },
  });

  const onDeleteManyData = (data: NonNullable<Post>[]) => {
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
      toast.error("Failed to delete some selected posts");
    }

    executeDeleteMany({ ids: deleted_ids });
  };

  return (
    <DataTable
      title="post"
      columns={postColumns}
      data={data}
      filterPlaceholder="Filter post..."
      filterKey="title"
      onDeleteManyData={onDeleteManyData}
    />
  );
};

const ActionButtons = ({ initialData }: { initialData: NonNullable<Post> }) => {
  const { execute: executeDelete } = useAction(deletePost, {
    onProceed: () => {
      toast.loading("Deleting post...", {
        id: "loading-delete-post",
      });
    },
    onSuccess: () => {
      toast.success(`post deleted!`);
    },
    onError: (error) => {
      toast.error(error);
    },
    onComplete() {
      toast.dismiss("loading-delete-post");
    },
  });

  const onDeleteData = (data: NonNullable<Post>) => {
    if (!data?.id) {
      toast.error("Failed to delete post");
      return;
    }

    executeDelete({ id: data?.id });
  };

  return (
    <div className="flex gap-4 items-center">
      <Link href={`/dashboard/posts/${initialData?.slug}`}>
        <Button
          size="icon"
          variant="outline"
          className="hover:text-primary-foreground hover:bg-primary"
        >
          <SquareArrowOutUpRight className="h-4 w-4" />
        </Button>
      </Link>
      <Link href={`/dashboard/posts/${initialData?.slug}/edit`}>
        <Button
          size="icon"
          variant="outline"
          className="hover:text-primary-foreground hover:bg-primary"
        >
          <Pen className="h-4 w-4" />
        </Button>
      </Link>
      <AlertDialogWrapper
        header={`Delete Post?`}
        description={`You will permanently delete the selected Post, this action can not be undone!`}
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
