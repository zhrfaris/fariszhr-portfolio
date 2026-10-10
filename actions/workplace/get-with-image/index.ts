"use server";

import { auth } from "@/auth";
import { Image as ImageType } from "@prisma/client";
import { getWorkplaces } from "../get";

export interface WorkplacePickerItem {
  id: string;
  name: string;
  image: ImageType;
}

/** List the current user's workplaces including their logo image — the
 * combobox select omits the image, which the Content-tab header row needs. */
export async function getWorkplacesForPicker(): Promise<WorkplacePickerItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const list = await getWorkplaces(session.user.id);
  return list.map((w) => ({ id: w.id, name: w.name, image: w.image }));
}
