import React from "react";
import PortfolioDetail from "@/components/portfolio-detail/portfolio-detail";
import { getPostBySlug } from "@/actions/post/get";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

interface PortfolioDetailPageProps {
  params: Promise<{ slug: string }>;
}

/* const sections: PostSection[] = [
    {
      id: "1",
      title: "What is Pinhome Home Service?",
      contents: [
        {
          id: "1",
          content: generateLoremIpsum(200),
          content_image_type: "DEFAULT",
          order: 0,
          image: undefined,
        },
      ],
      icon_type: "graduation_cap",
      order: 0,
    },
    {
      id: "2",
      title: "Role",
      contents: [
        {
          id: "1",
          content: generateLoremIpsum(200),
          content_image_type: "DEFAULT",
          order: 0,
          image: undefined,
        },
      ],
      icon_type: "graduation_cap",
      order: 1,
    },
    {
      id: "3",
      title: "Development & Release Timeline",
      contents: [
        {
          id: "1",
          content: generateLoremIpsum(200),
          content_image_type: "DEFAULT",
          order: 0,
          image: undefined,
        },
      ],
      icon_type: "graduation_cap",
      order: 2,
    },
    {
      id: "4",
      title: "Add service duration during on-going order feature",
      contents: [
        {
          id: "1",
          content: generateLoremIpsum(200),
          content_image_type: "DEFAULT",
          order: 0,
          image: undefined,
        },
      ],
      icon_type: "graduation_cap",
      order: 3,
    },
    {
      id: "5",
      title: "Background",
      contents: [
        {
          id: "1",
          content: generateLoremIpsum(200),
          content_image_type: "DEFAULT",
          order: 0,
          image: undefined,
        },
      ],
      icon_type: "graduation_cap",
      order: 4,
    },
    {
      id: "6",
      title: "Project Challenges",
      contents: [
        {
          id: "1",
          content: generateLoremIpsum(200),
          content_image_type: "DEFAULT",
          order: 0,
          image: undefined,
        },
      ],
      icon_type: "graduation_cap",
      order: 5,
    },
    {
      id: "7",
      title: "Research",
      contents: [
        {
          id: "1",
          content: generateLoremIpsum(200),
          content_image_type: "DEFAULT",
          order: 0,
          image: undefined,
        },
      ],
      icon_type: "graduation_cap",
      order: 6,
    },
    {
      id: "8",
      title: "Design Proposal",
      contents: [
        {
          id: "1",
          content: generateLoremIpsum(200),
          content_image_type: "DEFAULT",
          order: 0,
          image: undefined,
        },
      ],
      icon_type: "graduation_cap",
      order: 7,
    },
  ]; */

const PortfolioDetailPage = async ({ params }: PortfolioDetailPageProps) => {
  const { slug } = await params;
  const session = await auth();

  const post = await getPostBySlug(slug);

  if (!post) {
    redirect("/");
  }

  return <PortfolioDetail post={post} showEditButton={!!session?.user?.id} />;
};

export default PortfolioDetailPage;
