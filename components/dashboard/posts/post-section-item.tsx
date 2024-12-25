"use client";

import { PostSection } from "@/actions/post/create/types";
import PortfolioSection from "@/components/portfolio-detail/portfolio-section";
import { Button } from "@/components/shadcn/button";
import DropdownMenuWrapper, {
  DropdownMenuItem,
} from "@/components/wrappers/dropdown-menu-wrapper";
import { usePostForm } from "@/hooks/use-post-form";
import { EllipsisVertical, MoveDown, MoveUp, Pen, Trash2 } from "lucide-react";
import React from "react";
import PostSectionForm from "./post-section-form";

const PostSectionItem = ({ section }: { section: PostSection }) => {
  const {
    sections,
    editSectionData,
    setSections,
    setContents,
    setShowFormSection,
    setShowFormContent,
    setEditSectionData,
  } = usePostForm((state) => state);

  const changeSectionContentHandler = (section: PostSection) => {
    const newContents = sections.filter((c) => c.id !== section.id);
    setSections([...newContents, section]);
    setShowFormSection(false);
    setEditSectionData(null);
  };

  const moveItemUp = (order: number) => {
    if (order === 0) return; // Cannot move first item up

    const updatedSections = [...sections];

    // Update order of the items being swapped
    updatedSections[order - 1].order = order;
    updatedSections[order].order = order - 1;

    // Swap the items in the array
    [updatedSections[order - 1], updatedSections[order]] = [
      updatedSections[order],
      updatedSections[order - 1],
    ];

    setSections(updatedSections);
  };

  const moveItemDown = (order: number) => {
    if (order === sections.length - 1) return; // Cannot move last item down

    const udpatedContents = [...sections];

    // Update order of the items being swapped
    udpatedContents[order].order = order + 1;
    udpatedContents[order + 1].order = order;

    // Swap the items in the array
    [udpatedContents[order], udpatedContents[order + 1]] = [
      udpatedContents[order + 1],
      udpatedContents[order],
    ];

    setSections(udpatedContents);
  };

  const deleteItemHandler = () => {
    const updatedContents = sections.filter((c) => c.id !== section.id);

    // Update order of the remaining items
    updatedContents.forEach((c, index) => (c.order = index));

    setSections(updatedContents);
  };

  const editSectionHandler = () => {
    setEditSectionData(section);
    setContents(section.contents);
    setShowFormSection(false);
    if (section.contents.length > 0) {
      setShowFormContent(false);
    }
  };

  const listMenu: DropdownMenuItem[] = [
    {
      label: "Move up",
      Icon: MoveUp,
      disabled: section.order === 0,
      onClick: () => moveItemUp(section.order),
    },
    {
      label: "Move down",
      Icon: MoveDown,
      disabled: section.order === sections.length - 1,
      onClick: () => moveItemDown(section.order),
    },
    {
      label: "Edit",
      onClick: editSectionHandler,
      Icon: Pen,
    },
    {
      label: "Delete",
      color: "danger",
      onClick: deleteItemHandler,
      Icon: Trash2,
      showAlert: true,
    },
  ];

  if (section.id === editSectionData?.id) {
    return (
      <PostSectionForm
        sectionChange={changeSectionContentHandler}
        initialData={section}
      />
    );
  }

  return (
    <div className="border  w-full p-4 rounded-md mb-4 relative">
      <PortfolioSection section={section} />
      <div className="absolute top-2 right-2">
        <DropdownMenuWrapper align="end" listMenu={listMenu}>
          <Button variant="ghost" size="icon">
            <EllipsisVertical />
          </Button>
        </DropdownMenuWrapper>
      </div>
    </div>
  );
};

export default PostSectionItem;
