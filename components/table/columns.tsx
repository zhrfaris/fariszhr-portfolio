"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  Loader,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
import { Button } from "../shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import { Checkbox } from "../shadcn/checkbox";
import { DataTableColumnHeader, FilterBy } from "./data-table-column-header";
import { cn } from "@/lib/utils";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Status = "pending" | "processing" | "success" | "failed";

export type Payment = {
  id: string;
  amount: number;
  status: Status;
  email: string;
};

export const status: Status[] = ["failed", "pending", "processing", "success"];

export const filterByStatus: FilterBy[] = status.map((s) => ({
  title: s.charAt(0).toUpperCase() + s.slice(1),
  value: s,
  icon:
    s === "success"
      ? CheckCircle2
      : s === "failed"
      ? XCircle
      : s === "processing"
      ? Loader
      : AlertCircle,
}));

export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => {
      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      );
    },
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
  /* {
    id: "id",
    header: "",
    cell: ({ row }) => (
      <div className="font-medium text-center">{row.index + 1}</div>
    ),
  }, */
  {
    accessorKey: "email",
    // header: "Email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "amount",
    // header: "Amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    // header: "Status",
    header: ({ column, table }) => {
      return (
        <DataTableColumnHeader
          table={table}
          column={column}
          filterBy={filterByStatus}
          title="Status"
        />
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as Status;

      return (
        <div>
          <div className="w-fit flex items-center justify-center gap-4">
            {status === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : status === "failed" ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : status === "processing" ? (
              <Loader className="w-4 h-4 text-amber-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )}
            <p className={cn("font-medium")}>{status}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-full flex justify-center">
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
