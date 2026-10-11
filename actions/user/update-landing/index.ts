"use server";

import { db } from "@/lib/db";
import { UpdateLanding } from "./schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { ReturnType, InputType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { auth } from "@/auth";
import { actionErrorMessage } from "@/actions/utils";
import { toStoredLanyard } from "@/lib/lanyard-settings";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return {
      error: "Unauthorized",
    };
  }

  const {
    intro_product,
    intro_photo,
    card_front,
    card_back,
    band_image,
    lanyard,
  } = data;

  let user;

  try {
    user = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        intro_product: intro_product?.trim() || null,
        intro_photo: intro_photo?.trim() || null,
        card_front: { set: card_front },
        card_back: { set: card_back },
        band_image: { set: band_image },
        lanyard: { set: toStoredLanyard(lanyard) },
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: actionErrorMessage("Failed to update landing page", error),
    };
  }

  revalidateTag("user");
  revalidatePath("/dashboard/landing");
  revalidatePath("/");
  revalidatePath("/photography");
  return { data: user };
};

export const updateLanding = createSafeAction(UpdateLanding, handler);
