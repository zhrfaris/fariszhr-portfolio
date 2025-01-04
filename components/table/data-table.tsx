"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import { Button, buttonVariants } from "../shadcn/button";
import React, { ElementRef, useRef } from "react";
import { Input } from "../shadcn/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../shadcn/pagination";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Check, Pen, Trash, XIcon } from "lucide-react";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "../shadcn/popover";
import AlertDialogWrapper from "../wrappers/alert-dialog-wrapper";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title: string;
  filterKey?: string;
  pageSize?: number;
  filterPlaceholder?: string;
  isReordering?: boolean;
  onReorderData?: () => void;
  onDeleteData?: (data: TData) => void;
  onDeleteManyData?: (data: TData[]) => void;
  onEditData?: (
    data: TData,
    closePopoverRef: React.RefObject<HTMLButtonElement>
  ) => {
    form?: React.ReactNode;
    button?: React.ReactNode;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterPlaceholder,
  filterKey,
  pageSize = 9,
  title,
  isReordering,
  onReorderData,
  onEditData,
  onDeleteData,
  onDeleteManyData,
}: DataTableProps<TData, TValue>) {
  const closeEditPopoverRef = useRef<ElementRef<"button">>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [pagination, setPagination] = React.useState({
    pageIndex: 0, //initial page index
    pageSize, //default page size
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div>
      {/* Utilities */}
      <div className="flex items-center justify-between py-4 gap-4 flex-wrap">
        <div className="flex items-center justify-start gap-x-4">
          <Input
            placeholder={filterPlaceholder ?? "Filter emails..."}
            value={
              (table
                .getColumn(filterKey ?? "email")
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn(filterKey ?? "email")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center justify-end gap-x-4">
          {table.getSelectedRowModel().rows.length === 1 &&
            onEditData &&
            onEditData(
              table.getSelectedRowModel().rows[0].original,
              closeEditPopoverRef
            ).form && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Pen className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 pt-3" side="bottom">
                  <div className="text-sm font-medium text-center text-foreground/60 pb-4">
                    Edit {title}
                  </div>
                  <PopoverClose ref={closeEditPopoverRef} asChild>
                    <Button
                      variant="ghost"
                      className="h-auto w-auto p-2 absolute top-2 right-2 text-foreground/60"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </PopoverClose>
                  {
                    onEditData(
                      table.getSelectedRowModel().rows[0].original,
                      closeEditPopoverRef
                    ).form
                  }
                </PopoverContent>
              </Popover>
            )}
          {table.getSelectedRowModel().rows.length === 1 &&
            onEditData &&
            onEditData(
              table.getSelectedRowModel().rows[0].original,
              closeEditPopoverRef
            ).button && (
              <>
                {
                  onEditData(
                    table.getSelectedRowModel().rows[0].original,
                    closeEditPopoverRef
                  ).button
                }
              </>
            )}
          {table.getSelectedRowModel().rows.length === 1 && onDeleteData && (
            <AlertDialogWrapper
              header={`Delete ${title}?`}
              description={`You will permanently delete the selected ${title}, this action can not be undone!`}
              proceedHandler={() =>
                onDeleteData(table.getSelectedRowModel().rows[0].original)
              }
            >
              <Button
                variant="outline"
                className="hover:text-destructive-foreground hover:bg-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogWrapper>
          )}
          {table.getSelectedRowModel().rows.length > 0 && (
            <div className={cn(buttonVariants({ variant: "outline" }))}>
              {table.getSelectedRowModel().rows.length} items selected
            </div>
          )}
          {table.getSelectedRowModel().rows.length > 1 && onDeleteManyData && (
            <AlertDialogWrapper
              header={`Delete all of these ${title} data?`}
              description={`You will permanently delete the selected ${title} data, this action can not be undone!`}
              proceedHandler={() =>
                onDeleteManyData(
                  table.getSelectedRowModel().rows.map((item) => item.original)
                )
              }
            >
              <Button
                variant="outline"
                className="hover:text-destructive-foreground hover:bg-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </AlertDialogWrapper>
          )}
          {table.getSelectedRowModel().rows.length === 0 && onReorderData && (
            <Button variant="outline" onClick={onReorderData}>
              {isReordering ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="mr-2 h-4 w-4" />
              )}
              {isReordering ? "Save Order" : "Reorder List"}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination className="justify-end">
          <PaginationContent>
            {/* Previous Page */}
            <PaginationItem>
              <PaginationPrevious
                className={cn(
                  !table.getCanPreviousPage() &&
                    "opacity-30 pointer-events-none"
                )}
                onClick={() => table.previousPage()}
              />
            </PaginationItem>

            {/* Ellipsis */}
            {table.getState().pagination.pageIndex - 2 >= 0 && (
              <PaginationItem>
                <PaginationEllipsis
                  className="cursor-pointer"
                  onClick={() => table.setPageIndex(0)}
                />
              </PaginationItem>
            )}

            {/* Previous Page */}
            {table.getState().pagination.pageIndex - 1 >= 0 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() =>
                    table.setPageIndex(
                      table.getState().pagination.pageIndex - 1
                    )
                  }
                >
                  {table.getState().pagination.pageIndex}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Current Page */}
            <PaginationItem>
              <PaginationLink isActive>
                {table.getState().pagination.pageIndex + 1}
              </PaginationLink>
            </PaginationItem>

            {/* Next Page */}
            {table.getState().pagination.pageIndex + 1 <
              table.getPageCount() && (
              <PaginationItem>
                <PaginationLink
                  onClick={() =>
                    table.setPageIndex(
                      table.getState().pagination.pageIndex + 1
                    )
                  }
                >
                  {table.getState().pagination.pageIndex + 2}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis */}
            {table.getState().pagination.pageIndex + 2 <
              table.getPageCount() && (
              <PaginationItem>
                <PaginationEllipsis
                  className="cursor-pointer"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                />
              </PaginationItem>
            )}

            {/* Next page */}
            <PaginationItem>
              <PaginationNext
                className={cn(
                  !table.getCanNextPage() && "opacity-30 pointer-events-none"
                )}
                onClick={() => table.nextPage()}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
