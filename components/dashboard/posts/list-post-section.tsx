"use client";

import { PostSection } from "@/actions/post/create/types";
import { Label } from "@/components/shadcn/label";
import React, { useState } from "react";
import PostSectionForm from "./post-section-form";

const ListPostSection = () => {
  const [showFormPostSection, setShowFormPostSection] =
    useState<boolean>(false);
  const [sections, setSections] = useState<PostSection[]>([]);

  const addSectionHandler = () => setShowFormPostSection(true);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground/70">
        Section List
      </Label>
      <div className="flex items-center justify-center min-h-56 border border-black/30 rounded-md p-4">
        {sections.length <= 0 && !showFormPostSection && (
          <p>
            No section has been added to this post,{" "}
            <span className="text-sky-400" onClick={addSectionHandler}>
              Add one
            </span>
          </p>
        )}
        {sections.map((section, index) => (
          <div key={index}>
            <p>{section.title}</p>
          </div>
        ))}
        {showFormPostSection && (
          <PostSectionForm
            addSection={(section: PostSection) =>
              setSections([...sections, section])
            }
          />
        )}
      </div>
    </div>
  );
};

export default ListPostSection;
