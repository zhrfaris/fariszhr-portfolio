"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, Pen, Plus, Trash } from "lucide-react";

import { Workplace } from "@/actions/workplace/get/types";
import { deleteWorkplace } from "@/actions/workplace/delete";
import { ActionTooltip, IconAction } from "@/components/dashboard/icon-action";
import { SimpleTable } from "@/components/dashboard/simple-table";
import { buttonVariants } from "@/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import AlertDialogWrapper from "@/components/wrappers/alert-dialog-wrapper";
import { useAction } from "@/hooks/use-action";

type Row = NonNullable<Workplace>;

/** Workplaces: Name · Logo · Actions. A short list, nothing to sort, filter
 * or page through; the order isn't used on the live site, so no reordering. */
export const WorkplaceTable = ({ data }: { data: Row[] }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">No workplaces yet.</p>
        <Link href="/dashboard/workplaces/create" className={buttonVariants()}>
          <Plus />
          New workplace
        </Link>
      </div>
    );
  }

  return (
    <SimpleTable
      label="Workplaces"
      rows={data}
      rowKey={(w) => w.id}
      template="minmax(0,2fr) minmax(0,1fr) 108px"
      columns={[
        {
          header: "Name",
          cell: (w) => <span className="font-medium">{w.name}</span>,
        },
        {
          header: "Logo",
          cell: (w) =>
            w.image?.img_url_thumbnail ? (
              <Image
                src={w.image.img_url_thumbnail}
                alt=""
                width={100}
                height={100}
                className="h-6 w-auto max-w-[100px] object-contain"
              />
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        { header: "Actions", cell: (w) => <ActionButtons workplace={w} /> },
      ]}
    />
  );
};

const ActionButtons = ({ workplace }: { workplace: Row }) => {
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

  const onDelete = () => {
    if (!workplace?.id) {
      toast.error("Failed to delete workplace");
      return;
    }
    executeDelete({ id: workplace.id });
  };

  return (
    <div className="flex w-[108px] items-center gap-1.5">
      {workplace.url && (
        <ActionTooltip label="Open website">
          <IconAction aria-label="Open website" asChild>
            <Link href={workplace.url} target="_blank">
              <ExternalLink />
            </Link>
          </IconAction>
        </ActionTooltip>
      )}
      <ActionTooltip label="Edit">
        <IconAction aria-label="Edit" asChild>
          <Link href={`/dashboard/workplaces/${workplace.slug}/edit`}>
            <Pen />
          </Link>
        </IconAction>
      </ActionTooltip>
      <Tooltip>
        <AlertDialogWrapper
          header={`Delete Workplace?`}
          description={`You will permanently delete the selected Workplace, this action can not be undone!`}
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
