import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons";
import { Column, Table } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "../shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import { Dot, LucideIcon, RotateCcw } from "lucide-react";

export type FilterBy = {
  title: string;
  value: string;
  icon?: LucideIcon;
};

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  column: Column<TData, TValue>;
  title: string;
  filterBy?: Array<FilterBy>;
}

export function DataTableColumnHeader<TData, TValue>({
  table,
  column,
  title,
  className,
  filterBy,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="link" size="sm" className="-ml-3 h-8">
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        {!filterBy ? (
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUpIcon className="mr-2 h-3.5 w-3.5" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDownIcon className="mr-2 h-3.5 w-3.5 " />
              Desc
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeNoneIcon className="mr-2 h-3.5 w-3.5 " />
              Hide
            </DropdownMenuItem>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent align="start">
            {filterBy.map((filter) => (
              <DropdownMenuItem
                key={filter.value}
                className="cursor-pointer"
                onClick={() =>
                  table.getColumn("status")?.setFilterValue(filter.value)
                }
              >
                {filter.icon ? (
                  <filter.icon className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <Dot className="mr-2 h-3.5 w-3.5" />
                )}
                {filter.title}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                table.getColumn("status")?.setFilterValue(undefined)
              }
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Reset
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
