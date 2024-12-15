"use client";

import FormInput from "@/components/form/form-input";
import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/shadcn/button";
import { Separator } from "@/components/shadcn/separator";
import React from "react";

const ProfileForm = () => {
  const formAction = (formData: FormData) => {
    const name = formData.get("name") as string;
    const occupation = formData.get("occupation") as string;
    const tagline = formData.get("tagline") as string;
    const email = formData.get("email") as string;
    const linkedin_url = formData.get("linkedin_url") as string;
    const cv_url = formData.get("cv_url") as string;
    const deck_intro_url = formData.get("deck_intro_url") as string;

    console.log({
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
          <FormInput label="Name" id="name" required={true} />
          <FormInput label="Occupation" id="occupation" required={true} />
        </FormWrapper>
        <FormWrapper>
          <FormTextarea label="Tagline" id="tagline" required={true} />
          <FormInput label="Email" id="email" type="email" required={true} />
        </FormWrapper>
        <Separator />
        <FormWrapper>
          <FormInput label="CV url" id="cv_url" required={true} />
          <FormInput
            label="Deck intro url"
            id="deck_intro_url"
            required={true}
          />
        </FormWrapper>
        <FormWrapper>
          <FormInput label="LinkedIn url" id="linkedin_url" required={true} />
        </FormWrapper>
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
};

export default ProfileForm;
