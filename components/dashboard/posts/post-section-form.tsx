"use client";

import { PostSection, PostSectionContent } from "@/actions/post/create/types";
import FormInput from "@/components/form/form-input";
import { Button } from "@/components/shadcn/button";
import { toast } from "sonner";
import PostSectionContentForm from "./post-section-content-form";
import { usePostForm } from "@/hooks/use-post-form";
import { Label } from "@/components/shadcn/label";
import PostSectionContentItem from "./post-section-content-item";

interface PostSectionFormProps {
  addSection: (section: PostSection) => void;
  initialData?: PostSection;
}

const PostSectionForm = ({ addSection, initialData }: PostSectionFormProps) => {
  const {
    contents,
    sections,
    showFormSection,
    showFormContent,
    editContentData,
    setContents,
    setShowFormContent,
    setEditContentData,
  } = usePostForm((state) => state);

  const formAction = (formData: FormData) => {
    const title = formData.get("title") as string;
    const icon_type = formData.get("icon_type") as string;

    if (contents.length <= 0) {
      toast.error("Please add at least one content to this section.");
      return;
    }

    const payload: PostSection = {
      id: initialData?.id || crypto.randomUUID(),
      order: initialData?.order || sections.length || 0,
      title,
      icon_type,
      contents,
    };

    addSection(payload);
  };

  const changeSectionContentHandler = (content: PostSectionContent) => {
    setContents([...contents, content]);
    setShowFormContent(false);
  };

  return (
    <div className="space-y-6 w-full border border-black/30 rounded-md p-4">
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
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground/70">
            Section Contents
          </Label>
          <div className="flex flex-col h-fit gap-3">
            {contents
              .sort((a, b) => a.order - b.order)
              .map((content, index) => (
                <PostSectionContentItem key={index} content={content} />
              ))}
          </div>
        </div>
      )}

      {showFormContent && !editContentData && (
        <div>
          <PostSectionContentForm changeContent={changeSectionContentHandler} />
        </div>
      )}

      <div className="flex gap-4">
        {showFormSection &&
          !showFormContent &&
          !editContentData &&
          contents.length >= 1 && (
            <Button type="submit" form="post-section-form">
              Save Section
            </Button>
          )}
        {!showFormContent && !editContentData && (
          <Button type="button" onClick={() => setShowFormContent(true)}>
            Add {contents.length > 0 ? "More" : ""} Content
          </Button>
        )}
        {showFormContent && (
          <Button form="post-content-form" type="submit">
            Save content
          </Button>
        )}
        {editContentData && (
          <>
            <Button form="post-content-form" type="submit">
              Save changes
            </Button>
            <Button type="button" onClick={() => setEditContentData(null)}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PostSectionForm;
