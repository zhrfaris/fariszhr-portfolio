"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Image as ImageType } from "@prisma/client";
import { toast } from "sonner";

import { User } from "@/actions/user/get/type";
import { updateLanding } from "@/actions/user/update-landing";
import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/shadcn/button";
import { useAction } from "@/hooks/use-action";
import { useActiveUploadCount } from "@/components/dashboard/posts/block-editor/upload-manager";
import { deleteCloudinaryImage } from "@/components/dashboard/posts/block-editor/upload";
import CardPhotoSlot from "./card-photo-slot";
import LanyardSettingsSection from "./lanyard-settings-section";
import {
  CardDivider,
  FieldHint,
  SectionCard,
} from "@/components/dashboard/section-card";
import {
  PAGE_SHELL,
  PageColumn,
  StickyActionBar,
} from "@/components/dashboard/page-layout";
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
    (current: ImageType | null, set: (image: ImageType | null) => void) =>
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

  // Cancel: back to what is saved. Photos replaced this session go back too,
  // so they are no longer queued for deletion.
  const resetToSaved = () => {
    setCardFront(user?.card_front ?? null);
    setCardBack(user?.card_back ?? null);
    setBandImage(user?.band_image ?? null);
    setLanyard(resolveLanyard(user?.lanyard));
    orphanPublicIds.current.clear();
  };

  return (
    <form action={formAction} className={PAGE_SHELL}>
      <PageColumn>
        <SectionCard
          icon="intro"
          title="Intro"
          description="The first thing visitors see when they open your portfolio."
        >
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
          <FieldHint>
            The paragraph under the Product design / Photo works switcher.
          </FieldHint>
        </SectionCard>

        <SectionCard
          icon="idCardPhotos"
          title="ID card photos"
          description="Front and back photos for the ID card. Each mode has its own pair."
        >
          <CardPhotoSlot
            label="Front · Product design"
            description="Shown on / and while the 3D card loads."
            image={cardFront}
            onChange={replace(cardFront, setCardFront)}
          />
          <CardDivider />
          <CardPhotoSlot
            label="Back · Photo works"
            description="Shown on /photography."
            image={cardBack}
            onChange={replace(cardBack, setCardBack)}
          />
        </SectionCard>

        <LanyardSettingsSection
          value={lanyard}
          onChange={setLanyard}
          bandImage={bandImage}
          onBandImageChange={replace(bandImage, setBandImage)}
          errors={fieldErrors}
        />

        <p className="px-1 text-[13px] text-muted-foreground">
          Case studies come from{" "}
          <Link href="/dashboard/posts" className="underline">
            All case studies
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
      </PageColumn>

      <StickyActionBar>
        <Button
          type="reset"
          variant="ghost"
          disabled={isLoading}
          onClick={resetToSaved}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || uploadsInProgress}>
          {uploadsInProgress ? "Uploading…" : "Save changes"}
        </Button>
      </StickyActionBar>
    </form>
  );
};

export default LandingForm;
