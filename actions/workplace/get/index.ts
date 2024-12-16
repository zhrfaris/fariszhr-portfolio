import { db } from "@/lib/db";

export const getWorkplaces = async () => {
  return await db.workplace.findMany();
};
