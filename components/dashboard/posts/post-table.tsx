"use client";

import { z } from "zod";
import { toast } from "sonner";
import { Status } from "@/actions/types";
import { useAction } from "@/hooks/use-action";
import { Post } from "@/actions/post/get/types";
import { ColumnDef } from "@tanstack/react-table";
import { deletePost } from "@/actions/post/delete";
import { Button } from "@/components/shadcn/button";
import { capitalizeEachWord, cn } from "@/lib/utils";
import { Category } from "@/actions/category/get/types";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Workplace } from "@/actions/workplace/get/types";
import { DataTable } from "@/components/table/data-table";
import { deleteManyPosts } from "@/actions/post/delete-many";
import {
  ArrowUpDown,
  MoveDown,
  MoveUp,
  Pen,
  SquareArrowOutUpRight,
  Trash,
} from "lucide-react";

import Link from "next/link";
import AlertDialogWrapper from "@/components/wrappers/alert-dialog-wrapper";
import { usePostList } from "@/hooks/use-post-list";
import { useCallback, useEffect } from "react";
import { reorderPost } from "@/actions/post/reorder";
import { ReorderPost } from "@/actions/post/reorder/schema";

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
      const status = row.getValue("status") as z.infer<typeof Status>;

      return (
        <div className="max-w-[450px]">
          <p
            className={cn(
              "text-center rounded py-1 px-2 w-fit",
              status === Status.Values.ACTIVE
                ? "text-green-900 bg-green-200"
                : "text-sky-900 bg-sky-300"
            )}
          >
            {status === "ACTIVE" ? "Published" : "Draft"}
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
  const {
    posts,
    isReordering,
    postsToReorderAfterDelete,
    setPosts,
    setIsReordering,
    setPostsToReorderAfterDelete,
  } = usePostList((state) => state);

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

  const { execute: executeReorder } = useAction(reorderPost, {
    onProceed: () => {
      toast.loading("Saving current order of posts...", {
        id: "loading-reorder-posts",
      });
    },
    onSuccess: () => {
      toast.success(`current order of posts saved!`);
    },
    onError: (error) => {
      toast.error(error);
    },
    onComplete() {
      toast.dismiss("loading-reorder-posts");
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

    // console.log({ deleted_ids });

    const updatedPosts = [...posts];

    for (const id of deleted_ids) {
      const index = updatedPosts.findIndex((p) => p.id === id);
      if (index === -1) continue;

      updatedPosts.splice(index, 1);
    }

    // Update order of the remaining items
    updatedPosts.forEach((c, index) => (c.order = index));

    setPosts(updatedPosts);
    setPostsToReorderAfterDelete(updatedPosts);

    executeDeleteMany({ ids: deleted_ids });
  };

  const getChangedOrderPosts = useCallback(
    (postToReorder: NonNullable<Post>[]) => {
      const changedOrderPosts: NonNullable<Post>[] = [];

      for (const post of postToReorder) {
        const initialPost = data.find((d) => d.id === post.id);

        if (!initialPost) continue;

        if (initialPost.order === null) continue;

        if (initialPost.order !== post.order) {
          changedOrderPosts.push(post);
        }
      }

      return changedOrderPosts.map((p) => ({ id: p.id, order: p.order }));
    },
    [data]
  );

  const confirmReorder = useCallback(
    (postToReorder: NonNullable<Post>[]) => {
      const changedOrderPosts: z.infer<typeof ReorderPost> =
        getChangedOrderPosts(postToReorder);

      if (changedOrderPosts.length > 0) {
        executeReorder(changedOrderPosts);
        // console.log({ changedOrderPosts });
      }
    },
    [executeReorder, getChangedOrderPosts]
  );

  const toggleReorder = () => {
    if (isReordering) {
      confirmReorder(posts);
    }

    setIsReordering(!isReordering);
  };

  // set initial data post list to posts state
  useEffect(() => {
    // console.log({
    //   data: data.map((p) => ({ id: p.id, order: p.order, title: p.title })),
    // });
    setPosts(JSON.parse(JSON.stringify(data)));
  }, [data, setPosts]);

  // Reorder posts after deleting some posts
  useEffect(() => {
    if (postsToReorderAfterDelete.length === 0) return;

    // console.log(postsToReorderAfterDelete);
    confirmReorder(postsToReorderAfterDelete);
    setPostsToReorderAfterDelete([]);
  }, [confirmReorder, postsToReorderAfterDelete, setPostsToReorderAfterDelete]);

  return (
    <DataTable
      title="post"
      columns={postColumns}
      data={posts.length <= 0 ? data : posts}
      filterPlaceholder="Filter post..."
      filterKey="title"
      onDeleteManyData={onDeleteManyData}
      isReordering={isReordering}
      onReorderData={toggleReorder}
    />
  );
};

const ActionButtons = ({ initialData }: { initialData: NonNullable<Post> }) => {
  const { posts, isReordering, setPosts, setPostsToReorderAfterDelete } =
    usePostList((state) => state);

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

    const updatedPosts = posts.filter((c) => c.id !== data.id);

    // Update order of the remaining items
    updatedPosts.forEach((c, index) => (c.order = index));

    setPosts(updatedPosts);
    setPostsToReorderAfterDelete(updatedPosts);

    executeDelete({ id: data?.id });
  };

  const moveItemUp = (order: number) => {
    if (order === 0) return; // Cannot move first item up

    const updatedPosts = [...posts];

    // Update order of the items being swapped
    updatedPosts[order - 1].order = order;
    updatedPosts[order].order = order - 1;

    // Swap the items in the array
    [updatedPosts[order - 1], updatedPosts[order]] = [
      updatedPosts[order],
      updatedPosts[order - 1],
    ];

    setPosts([...updatedPosts]);
  };

  const moveItemDown = (order: number) => {
    if (order === posts.length - 1) return; // Cannot move last item down

    const udpatedPosts = [...posts];

    // Update order of the items being swapped
    udpatedPosts[order].order = order + 1;
    udpatedPosts[order + 1].order = order;

    // Swap the items in the array
    [udpatedPosts[order], udpatedPosts[order + 1]] = [
      udpatedPosts[order + 1],
      udpatedPosts[order],
    ];

    setPosts([...udpatedPosts]);
  };

  if (isReordering) {
    return (
      <div className="flex gap-4 items-center">
        <Button
          size="icon"
          variant="outline"
          onClick={() =>
            moveItemUp(posts.findIndex((p) => p.id === initialData.id))
          }
          disabled={posts.indexOf(initialData) === 0}
        >
          <MoveUp className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() =>
            moveItemDown(posts.findIndex((p) => p.id === initialData.id))
          }
          disabled={posts.indexOf(initialData) === posts.length - 1}
        >
          <MoveDown className="h-4 w-4" />
        </Button>
      </div>
    );
  }

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
