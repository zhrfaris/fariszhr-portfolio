"use client";

import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../shadcn/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { capitalizeEachWord, cn } from "@/lib/utils";
import { Skeleton } from "../shadcn/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";

const crumb_max_width = "max-w-[200px] line-clamp-[1]";

type Crumb = {
  label: string;
  link: string;
};

const HeaderBreadcrumb = () => {
  const params = usePathname();
  const [crumbs, setCrumbs] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState<Crumb | undefined>();
  const [rootPage, setRootPage] = useState<Crumb | undefined>();
  const [previousPage, setPreviousPage] = useState<Crumb | undefined>();
  const [restPages, setRestPages] = useState<Crumb[]>([]);

  useEffect(() => {
    if (crumbs.length === 0) {
      return;
    }

    const transformLabel = (slug: string) => {
      return capitalizeEachWord(slug.split("-").join(" "));
    };

    const getHref = (slug: string) => {
      let href = "/";

      for (const link of crumbs) {
        href = href + link + "/";
        if (link === slug) break;
      }

      return href;
    };

    const [root, ...rest] = crumbs;
    const current = rest.pop();
    const prev = rest.pop();

    setRootPage({
      label: transformLabel(root),
      link: getHref(root),
    });

    if (current) {
      setCurrentPage({
        label: transformLabel(current),
        link: getHref(current),
      });
    }

    if (prev) {
      setPreviousPage({
        label: transformLabel(prev),
        link: getHref(prev),
      });
    }

    setRestPages(
      rest.map((r) => ({
        label: transformLabel(r),
        link: getHref(r),
      }))
    );
  }, [crumbs]);

  useEffect(() => {
    const newCrumbs = params.split("/").filter((p) => p !== "");
    setCrumbs(newCrumbs);
  }, [params]);

  if (!rootPage) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Skeleton className="h-4 w-20 bg-black/30" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink>
              <Skeleton className="h-4 w-20 bg-black/30" />
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {rootPage && (
          <BreadcrumbItem>
            <BreadcrumbLink className={cn(crumb_max_width)} asChild>
              <Link href={rootPage.link}>{rootPage.label}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}

        {restPages.length > 1 && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {restPages.map((r) => (
                    <DropdownMenuItem key={r.label}>
                      <Link href={r.link}>{r.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}

        {restPages.length === 1 && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink asChild className={cn(crumb_max_width)}>
                <Link href={restPages[0].link}>{restPages[0].label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {previousPage && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink asChild className={cn(crumb_max_width)}>
                <Link href={previousPage.link}>{previousPage.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}

        {currentPage && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage
                className={cn("text-primary cursor-default", crumb_max_width)}
              >
                {currentPage.label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default HeaderBreadcrumb;
