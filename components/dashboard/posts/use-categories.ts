"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getCategoriesComboboxAction } from "@/actions/category/get-list";
import { createCategory } from "@/actions/category/create";

export interface CategoryOption {
  id: string;
  name: string;
}

/** Loads all categories once and exposes a create helper for the chip
 * multi-select. */
export function useCategories() {
  const [options, setOptions] = useState<CategoryOption[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getCategoriesComboboxAction({}).then((res) => {
      if (active && res?.data) {
        setOptions(res.data.map((c) => ({ id: c.id, name: c.option_name })));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const create = useCallback(
    async (name: string): Promise<CategoryOption | null> => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      setBusy(true);
      const res = await createCategory({ name: trimmed });
      setBusy(false);
      if (res?.data) {
        const opt = { id: res.data.id, name: res.data.name };
        setOptions((prev) => [...prev, opt]);
        return opt;
      }
      toast.error(res?.error ?? "Failed to create category");
      return null;
    },
    []
  );

  return { options, busy, create };
}
