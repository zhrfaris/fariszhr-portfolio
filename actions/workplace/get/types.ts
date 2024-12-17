import { Prisma } from "@prisma/client";
import { getWorkplaceById, getWorkplaces } from ".";

export type Workplaces = Prisma.PromiseReturnType<typeof getWorkplaces>;
export type Workplace = Prisma.PromiseReturnType<typeof getWorkplaceById>;
