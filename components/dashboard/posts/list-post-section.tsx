"use client";

import { PostSection } from "@/actions/post/create/types";
import { Label } from "@/components/shadcn/label";
import PostSectionForm from "./post-section-form";
import { usePostForm } from "@/hooks/use-post-form";
import { Button } from "@/components/shadcn/button";
import PostSectionItem from "./post-section-item";

const ListPostSection = () => {
  const { sections, showFormSection, setSections, setShowFormSection } =
    usePostForm((state) => state);

  const addSectionHandler = () => setShowFormSection(true);

  const onChangeSectionHandler = (section: PostSection) => {
    setSections([...sections, section]);
    setShowFormSection(false);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground/70">
        Section List
      </Label>
      <div className="flex flex-col min-h-56 items-center justify-center border border-black/30 rounded-md p-4">
        {sections.length <= 0 && !showFormSection && (
          <p className="text-center w-full">
            No section has been added to this post,{" "}
            <Button
              variant="ghost"
              className="text-sky-400"
              onClick={addSectionHandler}
            >
              Add one
            </Button>
          </p>
        )}
        {sections.map((section) => (
          <PostSectionItem key={section.id} section={section} />
        ))}
        {showFormSection && (
          <PostSectionForm addSection={onChangeSectionHandler} />
        )}
      </div>
    </div>
  );
};

export default ListPostSection;
