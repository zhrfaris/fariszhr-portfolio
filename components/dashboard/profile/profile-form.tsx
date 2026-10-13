"use client";

import { User } from "@/actions/user/get/type";
import { updateUser } from "@/actions/user/update";
import FormInput from "@/components/form/form-input";
import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/shadcn/button";
import { useAction } from "@/hooks/use-action";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import useCloudinary from "@/hooks/use-cloudinary";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldHint, SectionCard } from "@/components/dashboard/section-card";
import {
  PAGE_SHELL,
  PageColumn,
  StickyActionBar,
} from "@/components/dashboard/page-layout";

const ProfileForm = ({ user }: { user: User }) => {
  const {
    currentImage: profileImage,
    deleteUnUsedImages,
    onSuccessUploadImageHandler,
  } = useCloudinary({
    initialImage: user?.photo || undefined,
  });

  const { execute, fieldErrors, isLoading } = useAction(updateUser, {
    onProceed: () => {
      toast.loading("Updating profile...", { id: "loading-update-profile" });
    },
    onSuccess: async () => {
      toast.success("Profile updated!");
      await deleteUnUsedImages();
    },
    onComplete: () => {
      toast.dismiss("loading-update-profile");
    },
  });

  const formAction = (formData: FormData) => {
    const name = formData.get("name") as string;
    const occupation = formData.get("occupation") as string;
    const tagline = formData.get("tagline") as string;
    const email = formData.get("email") as string;
    const linkedin_url = formData.get("linkedin_url") as string;
    const cv_url = formData.get("cv_url") as string;
    const deck_intro_url = formData.get("deck_intro_url") as string;

    if (!user) {
      toast.error("Unauthenticated!");
      return;
    }

    execute({
      id: user?.id,
      name,
      occupation,
      tagline,
      email,
      linkedin_url,
      cv_url,
      deck_intro_url,
      photo: profileImage
        ? { ...profileImage, img_type: profileImage?.img_type }
        : undefined,
    });
  };

  return (
    <form action={formAction} className={PAGE_SHELL}>
      <PageColumn>
        <SectionCard
          icon="photo"
          title="Photo"
          description="Your profile photo, shown on your portfolio and ID card."
        >
          <CldUploadWidget
            onSuccess={onSuccessUploadImageHandler}
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            options={{
              sources: ["local", "url"],
              clientAllowedFormats: ["png", "jpg", "jpeg", "gif", "svg"],
              maxFileSize: 3_000_000,
              multiple: false,
            }}
          >
            {({ open }) => (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label={
                    profileImage?.img_url ? "Change photo" : "Add photo"
                  }
                  onClick={() => open()}
                  className={cn(
                    "relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground outline-none focus-visible:ring-focus focus-visible:ring-ring",
                    profileImage?.img_url
                      ? "border"
                      : "border border-dashed border-input hover:bg-secondary"
                  )}
                >
                  {profileImage?.img_url ? (
                    <Image
                      src={profileImage.img_url}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <ImagePlus className="size-5" />
                  )}
                </button>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => open()}
                  >
                    {profileImage?.img_url ? "Change photo" : "Add photo"}
                  </Button>
                  <FieldHint>PNG, JPG, GIF or SVG, up to 3 MB.</FieldHint>
                </div>
              </div>
            )}
          </CldUploadWidget>
        </SectionCard>

        <SectionCard
          icon="personalInfo"
          title="Personal info"
          description="Your name, role, and tagline as they appear on your portfolio."
        >
          <FormInput
            label="Name"
            id="name"
            defaultValue={user?.name}
            required={true}
            errors={fieldErrors}
          />
          <FormInput
            label="Occupation"
            id="occupation"
            defaultValue={user?.occupation}
            required={true}
            errors={fieldErrors}
          />
          <FormTextarea
            label="Tagline"
            id="tagline"
            defaultValue={user?.tagline}
            required={true}
            errors={fieldErrors}
            className="h-auto min-h-24 py-2"
          />
          <FormInput
            label="Email"
            id="email"
            type="email"
            defaultValue={user?.email}
            required={true}
            errors={fieldErrors}
          />
        </SectionCard>

        <SectionCard
          icon="links"
          title="Links"
          description="Files and profiles visitors can open from your portfolio."
        >
          <FormInput
            label="CV link"
            id="cv_url"
            defaultValue={user?.cv_url || ""}
            errors={fieldErrors}
          />
          <FormInput
            label="Intro deck link"
            id="deck_intro_url"
            defaultValue={user?.deck_intro_url || ""}
            errors={fieldErrors}
          />
          <FormInput
            label="LinkedIn profile"
            id="linkedin_url"
            defaultValue={user?.linkedin_url || ""}
            errors={fieldErrors}
          />
        </SectionCard>
      </PageColumn>

      <StickyActionBar>
        {/* Reset puts the fields back to their saved values. */}
        <Button type="reset" variant="ghost" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          Save changes
        </Button>
      </StickyActionBar>
    </form>
  );
};

export default ProfileForm;
