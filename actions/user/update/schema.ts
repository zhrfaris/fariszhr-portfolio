import { z } from "zod";
import { CreateUser } from "../create/schema";

export const UpdateUser = CreateUser.omit({
  password: true,
  username: true,
}).merge(z.object({ id: z.string() }));
