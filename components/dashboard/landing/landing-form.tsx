"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Image as ImageType } from "@prisma/client";
import { toast } from "sonner";

import { User } from "@/actions/user/get/type";
import { updateLanding } from "@/actions/user/update-landing";
import FormTextarea from "@/components/form/form-textarea";
import FormWrapper from "@/components/form/form-wrapper";
import { Button } from "@/components/shadcn/button";
import { Separator } from "@/components/shadcn/separator";
import { useAction } from "@/hooks/use-action";
import { useActiveUploadCount } from "@/components/dashboard/posts/block-editor/upload-manager";
import { deleteCloudinaryImage } from "@/components/dashboard/posts/block-editor/upload";
import CardPhotoSlot from "./card-photo-slot";
import LanyardSettingsSection from "./lanyard-settings-section";
import { LanyardSettings, resolveLanyard } from "@/lib/lanyard-settings";

const LandingForm = ({ user }: { user: User }) => {
  const [cardFront, setCardFront] = useState<ImageType | null>(
    user?.card_front ?? null
  );
  const [cardBack, setCardBack] = useState<ImageType | null>(
    user?.card_back ?? null
  );
  const [bandImage, setBandImage] = useState<ImageType | null>(
    user?.band_image ?? null
  );
  const [lanyard, setLanyard] = useState<LanyardSettings>(() =>
    resolveLanyard(user?.lanyard)
  );

  // Card photos replaced or removed before a save are deleted from Cloudinary
  // only after the save commits, same as the post editor.
  const orphanPublicIds = useRef<Set<string>>(new Set());
  const replace =
    (
      current: ImageType | null,
      set: (image: ImageType | null) => void
    ) =>
    (next: ImageType | null) => {
      if (current?.public_id && current.public_id !== next?.public_id) {
        orphanPublicIds.current.add(current.public_id);
      }
      set(next);
    };

  const uploadsInProgress = useActiveUploadCount() > 0;

  const { execute, fieldErrors, isLoading } = useAction(updateLanding, {
    onProceed: () => {
      toast.loading("Saving landing page...", { id: "loading-update-landing" });
    },
    onSuccess: async () => {
      toast.success("Landing page saved!");
      const ids = [...orphanPublicIds.current];
      orphanPublicIds.current.clear();
      await Promise.all(ids.map((id) => deleteCloudinaryImage(id)));
    },
    onError: (error) => {
      toast.error(error);
    },
    onFieldError: (errors) => {
      if (errors.lanyard) toast.error("Check the lanyard settings values");
    },
    onComplete: () => {
      toast.dismiss("loading-update-landing");
    },
  });

  const formAction = (formData: FormData) => {
    if (!user) {
      toast.error("Unauthenticated!");
      return;
    }

    execute({
      intro_product: formData.get("intro_product") as string,
      intro_photo: formData.get("intro_photo") as string,
      card_front: cardFront,
      card_back: cardBack,
      band_image: bandImage,
      lanyard,
    });
  };

  return (
    <form action={formAction} className="max-w-4xl space-y-8 @container">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Intro text</h2>
          <p className="text-sm text-muted-foreground">
            The paragraph under the Product design / Photo works switcher.
          </p>
        </div>
        <FormWrapper>
          <FormTextarea
            label="Product design intro (/)"
            id="intro_product"
            defaultValue={user?.intro_product ?? ""}
            placeholder="Hello! I'm Faris, a Product Designer at…"
            className="h-auto min-h-40 py-3 leading-relaxed"
            errors={fieldErrors}
          />
          <FormTextarea
            label="Photo works intro (/photography)"
            id="intro_photo"
            defaultValue={user?.intro_photo ?? ""}
            placeholder="Hello! I'm Faris. I photograph the way memories look…"
            className="h-auto min-h-40 py-3 leading-relaxed"
            errors={fieldErrors}
          />
        </FormWrapper>
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">ID card photos</h2>
          <p className="text-sm text-muted-foreground">
            The hanging card flips between these two when the mode changes.
          </p>
        </div>
        <div className="grid gap-6 @md:grid-cols-2">
          <CardPhotoSlot
            label="Front · Product design"
            description="Shown on / and while the 3D card loads."
            image={cardFront}
            onChange={replace(cardFront, setCardFront)}
          />
          <CardPhotoSlot
            label="Back · Photo works"
            description="Shown on /photography."
            image={cardBack}
            onChange={replace(cardBack, setCardBack)}
          />
        </div>
      </section>

      <Separator />

      <LanyardSettingsSection
        value={lanyard}
        onChange={setLanyard}
        bandImage={bandImage}
        onBandImageChange={replace(bandImage, setBandImage)}
        errors={fieldErrors}
      />

      <Separator />

      <p className="text-sm text-muted-foreground">
        Case studies come from{" "}
        <Link href="/dashboard/posts" className="underline">
          Posts
        </Link>
        , the photo grid from{" "}
        <Link href="/dashboard/gallery" className="underline">
          Photo Works
        </Link>
        , and the footer&apos;s email, LinkedIn and CV from{" "}
        <Link href="/dashboard/profile/edit-profile" className="underline">
          Profile
        </Link>
        .
      </p>

      <Button type="submit" disabled={isLoading || uploadsInProgress}>
        {uploadsInProgress ? "Uploading…" : "Save"}
      </Button>
    </form>
  );
};

export default LandingForm;
