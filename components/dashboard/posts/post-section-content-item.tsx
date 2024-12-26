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
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PostSectionContentItemProps {
  content: PostSectionContent;
}

const PostSectionContentItem = ({ content }: PostSectionContentItemProps) => {
  const [showMore, setShowMore] = useState(true);
  const [showShowMoreButton, setShowShowMoreButton] = useState(false);

  const contentItemRef = useRef<HTMLDivElement>(null);

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

  const deleteItemHandler = () => {
    const updatedContents = contents.filter((c) => c.id !== content.id);

    // Update order of the remaining items
    updatedContents.forEach((c, index) => (c.order = index));

    setContents(updatedContents);
  };

  const editItemHandler = () => {
    setEditContentData(content);
    setShowFormContent(false);
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
      onClick: editItemHandler,
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

  useEffect(() => {
    if (!contentItemRef.current) return;

    const clientHeight = contentItemRef.current.clientHeight;

    if (clientHeight > 300) {
      setShowMore(false);
      setShowShowMoreButton(true);
    }
  }, []);

  if (content.id === editContentData?.id) {
    return (
      <PostSectionContentForm
        changeContent={changeSectionContentHandler}
        initialData={content}
      />
    );
  }

  return (
    <div className="border border-black/30 rounded-md p-4 pt-12 relative ">
      <div
        ref={contentItemRef}
        className={cn(
          "flex items-start",
          showMore ? "max-h-none" : "max-h-[300px] overflow-hidden rounded-sm"
        )}
      >
        <div className="flex-1 space-y-4">
          <SanitizedHtml innerHTML={content.content} />
          {content.image && (
            <div className="relative w-full rounded-lg overflow-hidden">
              <Image
                src={content.image?.img_url}
                alt=""
                className="w-full object-contain"
                width={content.image?.img_width}
                height={content.image?.img_width}
              />
              <div className="absolute top-4 left-4 bg-white text-black mix-blend-difference rounded-lg p-2 text-sm capitalize">
                {content.content_image_type}
              </div>
            </div>
          )}
        </div>
      </div>
      {showShowMoreButton && (
        <Button
          className="w-full mt-4"
          variant="outline"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Show less" : "Show more"}
        </Button>
      )}
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

export default PostSectionContentItem;
