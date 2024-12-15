"use client";

import { User } from "@/actions/user/get/type";
import { updateUser } from "@/actions/user/update";
import FormInput from "@/components/form/form-input";
import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/shadcn/button";
import { Separator } from "@/components/shadcn/separator";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";

const ProfileForm = ({ user }: { user: User }) => {
  const { execute, fieldErrors, isLoading } = useAction(updateUser, {
    onProceed: () => {
      toast.loading("Updating profile...", { id: "loading-update-profile" });
    },
    onSuccess: () => {
      toast.success("Profile updated!");
    },
    onComplete() {
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
    });
  };

  const FormWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="grid md:grid-cols-2 gap-4 md:gap-8 w-full">
        {children}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-start">
      <div>
        <div className="size-56 rounded-full bg-muted"></div>
      </div>
      <form action={formAction} className="flex-1 space-y-6">
        <FormWrapper>
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
        </FormWrapper>
        <FormWrapper>
          <FormTextarea
            label="Tagline"
            id="tagline"
            defaultValue={user?.tagline}
            required={true}
            errors={fieldErrors}
          />
          <FormInput
            label="Email"
            id="email"
            type="email"
            defaultValue={user?.email}
            required={true}
            errors={fieldErrors}
          />
        </FormWrapper>
        <Separator />
        <FormWrapper>
          <FormInput
            label="CV url"
            id="cv_url"
            defaultValue={user?.cv_url || ""}
            errors={fieldErrors}
          />
          <FormInput
            label="Deck intro url"
            id="deck_intro_url"
            defaultValue={user?.deck_intro_url || ""}
            errors={fieldErrors}
          />
        </FormWrapper>
        <FormWrapper>
          <FormInput
            label="LinkedIn url"
            id="linkedin_url"
            defaultValue={user?.linkedin_url || ""}
            errors={fieldErrors}
          />
        </FormWrapper>
        <Button type="submit" disabled={isLoading}>
          Save
        </Button>
      </form>
    </div>
  );
};

export default ProfileForm;
