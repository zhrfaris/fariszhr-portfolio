import React from "react";

import { PageColumn, PageShell } from "./page-layout";

/**
 * Every dashboard page: the #F5F5F7 page with its centered column of section
 * cards. The page title lives in the breadcrumb; here it is only the (visually
 * hidden) heading. Form pages pass `bare` and lay out their own <form> with
 * PageColumn + StickyActionBar, so the bar's submit button is in the form.
 */
function DbPageWrapper({
  title,
  bare,
  children,
}: {
  title: string;
  bare?: boolean;
  children: React.ReactNode;
}) {
  return (
    <PageShell>
      <h1 className="sr-only">{title}</h1>
      {bare ? children : <PageColumn>{children}</PageColumn>}
    </PageShell>
  );
}

export default DbPageWrapper;
