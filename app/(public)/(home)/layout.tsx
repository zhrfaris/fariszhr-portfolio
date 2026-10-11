import { Image as ImageType } from "@prisma/client";

import { getUser } from "@/components/landing/data";
import LandingFooter from "@/components/landing/landing-footer";
import LandingShell, { CardFace } from "@/components/landing/landing-shell";
import { cldUrl } from "@/lib/landing";
import { resolveLanyard } from "@/lib/lanyard-settings";

const toFace = (image?: ImageType | null): CardFace | null =>
  image?.img_url
    ? {
        url: cldUrl(image.img_url, "w_1024,c_limit,q_auto,f_auto"),
      }
    : null;

/**
 * Shared frame for "/" (Product design) and "/photography" (Photo works):
 * the hanging ID card, the mode switcher and the footer. Being a layout, it
 * stays mounted while the two pages swap underneath it.
 */
export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = (await getUser()) ?? undefined;

  return (
    <LandingShell
      // Until a card front is uploaded, fall back to the profile photo.
      front={toFace(user?.card_front ?? user?.photo)}
      back={toFace(user?.card_back)}
      bandImage={
        user?.band_image?.img_url
          ? cldUrl(user.band_image.img_url, "w_1600,c_limit,q_auto,f_auto")
          : undefined
      }
      lanyard={resolveLanyard(user?.lanyard)}
      footer={<LandingFooter user={user} />}
    >
      {children}
    </LandingShell>
  );
}
