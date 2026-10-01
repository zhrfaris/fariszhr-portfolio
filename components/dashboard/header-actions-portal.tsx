"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** DOM id of the slot in the dashboard header where pages inject their own
 * actions (rendered in the layout). */
export const HEADER_ACTIONS_SLOT_ID = "dashboard-header-actions";

/**
 * Renders its children into the dashboard header's actions slot via a portal.
 * The portaled subtree stays part of the caller's React tree, so it can share
 * state/props with the page without any global store. Renders nothing until
 * mounted (the slot only exists on the client).
 */
export default function HeaderActionsPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.getElementById(HEADER_ACTIONS_SLOT_ID));
  }, []);

  if (!slot) return null;
  return createPortal(children, slot);
}
