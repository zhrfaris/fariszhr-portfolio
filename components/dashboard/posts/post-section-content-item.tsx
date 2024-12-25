"use client";

import { PostSectionContent } from "@/actions/post/create/types";
import SanitizedHtml from "@/components/common/sanitized-html";
import { Button } from "@/components/shadcn/button";
import DropdownMenuWrapper, {
  DropdownMenuItem,
} from "@/components/wrappers/dropdown-menu-wrapper";
import { usePostForm } from "@/hooks/use-post-form";
import { EllipsisVertical, MoveDown, MoveUp, Pen, Trash2 } from "lucide-react";
import PostSectionContentForm from "./post-section-content-form";

interface PostSectionContentItemProps {
  content: PostSectionContent;
}

const PostSectionContentItem = ({ content }: PostSectionContentItemProps) => {
  const {
    editContentData,
    contents,
    setEditContentData,
    setShowFormContent,
    setContents,
  } = usePostForm((state) => state);

  const changeSectionContentHandler = (content: PostSectionContent) => {
    const newContents = contents.filter((c) => c.id !== content.id);
    setContents([...newContents, content]);
    setShowFormContent(false);
    setEditContentData(null);
  };

  const moveItemUp = (order: number) => {
    if (order === 0) return; // Cannot move first item up

    const updatedContents = [...contents];

    // Update order of the items being swapped
    updatedContents[order - 1].order = order;
    updatedContents[order].order = order - 1;

    // Swap the items in the array
    [updatedContents[order - 1], updatedContents[order]] = [
      updatedContents[order],
      updatedContents[order - 1],
    ];

    setContents(updatedContents);
  };

  const moveItemDown = (order: number) => {
    if (order === contents.length - 1) return; // Cannot move last item down

    const udpatedContents = [...contents];

    // Update order of the items being swapped
    udpatedContents[order].order = order + 1;
    udpatedContents[order + 1].order = order;

    // Swap the items in the array
    [udpatedContents[order], udpatedContents[order + 1]] = [
      udpatedContents[order + 1],
      udpatedContents[order],
    ];

    setContents(udpatedContents);
  };

  const deleteItem = () => {
    const updatedContents = contents.filter((c) => c.id !== content.id);

    // Update order of the remaining items
    updatedContents.forEach((c, index) => (c.order = index));

    setContents(updatedContents);
  };

  const listMenu: DropdownMenuItem[] = [
    {
      label: "Move up",
      Icon: MoveUp,
      disabled: content.order === 0,
      onClick: () => moveItemUp(content.order),
    },
    {
      label: "Move down",
      Icon: MoveDown,
      disabled: content.order === contents.length - 1,
      onClick: () => moveItemDown(content.order),
    },
    {
      label: "Edit",
      onClick: () => setEditContentData(content),
      Icon: Pen,
    },
    {
      label: "Delete",
      color: "danger",
      onClick: deleteItem,
      Icon: Trash2,
      showAlert: true,
    },
  ];

  if (content.id === editContentData?.id) {
    return (
      <PostSectionContentForm
        changeContent={changeSectionContentHandler}
        initialData={content}
      />
    );
  }

  return (
    <div className="flex items-start border border-black/30 rounded-md p-4">
      <div className="flex-1">
        <SanitizedHtml innerHTML={content.content} />
      </div>
      <div className="">
        <DropdownMenuWrapper align="end" listMenu={listMenu}>
          <Button variant="ghost" size="icon">
            <EllipsisVertical />
          </Button>
        </DropdownMenuWrapper>
      </div>
    </div>
  );
};

export default PostSectionContentItem;
