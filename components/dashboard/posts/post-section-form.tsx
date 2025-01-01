"use client";

import { PostSection, PostSectionContent } from "@/actions/post/create/types";
import FormInput from "@/components/form/form-input";
import { Button } from "@/components/shadcn/button";
import { toast } from "sonner";
import PostSectionContentForm from "./post-section-content-form";
import { usePostForm } from "@/hooks/use-post-form";
import { Label } from "@/components/shadcn/label";
import PostSectionContentItem from "./post-section-content-item";
import FormSelectIcon from "@/components/form/form-select-icon";

interface PostSectionFormProps {
  sectionChange: (section: PostSection) => void;
  initialData?: PostSection;
}

const PostSectionForm = ({
  sectionChange,
  initialData,
}: PostSectionFormProps) => {
  const {
    contents,
    sections,
    showFormSection,
    showFormContent,
    editContentData,
    editSectionData,
    setContents,
    setShowFormContent,
    setEditContentData,
    setShowFormSection,
    setEditSectionData,
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
      order: initialData?.order ?? sections.length,
      title,
      icon_type,
      contents,
    };

    sectionChange(payload);
  };

  const changeSectionContentHandler = (content: PostSectionContent) => {
    setContents([...contents, content]);
    setShowFormContent(false);
  };

  const cancelFormSectionHandler = () => {
    setShowFormSection(false);
    setShowFormContent(false);
    setContents([]);
    setEditSectionData(null);
  };

  const cancelFormContentHandler = () => {
    setShowFormContent(false);
    setEditContentData(null);
  };

  return (
    <div className="space-y-6 w-full border border-black/30 rounded-md p-4 mb-4">
      <form
        id="post-section-form"
        action={formAction}
        className="flex-1 space-y-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <FormSelectIcon
            label="Section Icon"
            id="icon_type"
            defaultValue={initialData?.icon_type}
            required={true}
          />
          <div className="flex-1">
            <FormInput
              label="Section Title"
              id="title"
              defaultValue={initialData?.title}
              placeholder="Insert section title"
              required={true}
            />
          </div>
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
        {(showFormSection || editSectionData) &&
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditContentData(null)}
            >
              Cancel Edit Content
            </Button>
          </>
        )}
        {!!showFormSection && !!showFormContent && (
          <Button
            type="button"
            variant="outline"
            onClick={cancelFormSectionHandler}
          >
            Cancel Add Section
          </Button>
        )}
        {!!showFormSection && !showFormContent && (
          <Button
            type="button"
            variant="outline"
            onClick={cancelFormSectionHandler}
          >
            Cancel Add Section
          </Button>
        )}
        {!!editSectionData && !editContentData && !showFormContent && (
          <Button
            type="button"
            variant="outline"
            onClick={cancelFormSectionHandler}
          >
            Cancel Edit Section
          </Button>
        )}
        {showFormContent && contents.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={cancelFormContentHandler}
          >
            Cancel Add Content
          </Button>
        )}
      </div>
    </div>
  );
};

export default PostSectionForm;
