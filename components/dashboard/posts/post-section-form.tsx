"use client";

import { PostSection, PostSectionContent } from "@/actions/post/create/types";
import FormInput from "@/components/form/form-input";
// import PopoverForm from "@/components/form/popover-form";
import { Button } from "@/components/shadcn/button";
import React, { useState } from "react";
import { toast } from "sonner";
import PostSectionContentForm from "./post-section-content-form";
// import DialogForm from "@/components/form/dialog-form";
// import SheetForm from "@/components/form/sheet-form";

interface PostSectionFormProps {
  addSection: (section: PostSection) => void;
  initialData?: PostSection;
}

const PostSectionForm = ({ addSection, initialData }: PostSectionFormProps) => {
  const [showSectionContentForm, setShowSectionContentForm] =
    useState<boolean>(true);
  const [contents, setContents] = useState<PostSectionContent[]>([]);

  const formAction = (formData: FormData) => {
    const title = formData.get("title") as string;
    const icon_type = formData.get("icon_type") as string;

    if (contents.length <= 0) {
      toast.error("Please add at least one content to this section.");
      return;
    }

    const payload: PostSection = {
      title,
      icon_type,
      contents,
    };

    addSection(payload);
  };

  const addSectionContentHandler = (content: PostSectionContent) => {
    setContents((prev) => [...prev, content]);
    setShowSectionContentForm(false);
  };

  return (
    <div className="space-y-6">
      <form
        id="post-section-form"
        action={formAction}
        className="flex-1 space-y-6"
      >
        <div className="flex gap-4">
          <FormInput
            label="Section Icon"
            id="icon_type"
            defaultValue={initialData?.icon_type}
            required={true}
          />
          <FormInput
            label="Section Title"
            id="title"
            defaultValue={initialData?.title}
            required={true}
          />
        </div>
      </form>

      {contents.length > 0 && (
        <div className="flex items-center justify-center h-56 border border-black/30 rounded-md">
          {contents.map((content, index) => (
            <div key={index}>
              <p>{content.content}</p>
            </div>
          ))}
        </div>
      )}

      {showSectionContentForm && (
        <div>
          <PostSectionContentForm addContent={addSectionContentHandler} />
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" form="post-section-form">
          Save
        </Button>
      </div>
    </div>
  );
};

export default PostSectionForm;
