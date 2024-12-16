import { Prisma } from "@prisma/client";
import { getWorkplaces } from ".";

export type Workplaces = Prisma.PromiseReturnType<typeof getWorkplaces>;
