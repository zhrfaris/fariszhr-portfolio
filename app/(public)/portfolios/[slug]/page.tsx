import React from "react";
import PortfolioDetail from "@/components/portfolio-detail/portfolio-detail";
import {
  getPostBySlug,
  getPostForMetadata,
  getPostSlugsShowCase,
} from "@/actions/post/get";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Metadata, ResolvingMetadata } from "next";
import { MAIN_USERNAME } from "@/lib/db";

interface PortfolioDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 600;

export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPostSlugsShowCase(MAIN_USERNAME);

  return posts.map((post) => ({
    slug: String(post.slug),
  }));
}

export async function generateMetadata(
  { params }: PortfolioDetailPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPostForMetadata(slug);
  const previousImages = (await parent).openGraph?.images || [];
  const notFoundMetadata = {
    title: "Not Found",
    description: "The page you are looking for is doesn't exist.",
  };

  try {
    if (!post) return notFoundMetadata;
    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        images: [...previousImages],
      },
    };
  } catch (error) {
    console.error(error);
    return notFoundMetadata;
  }
}

const PortfolioDetailPage = async ({ params }: PortfolioDetailPageProps) => {
  const { slug } = await params;
  const session = await auth();

  const post = await getPostBySlug(slug);

  if (!post || post.status === "INACTIVE") {
    notFound();
  }

  return <PortfolioDetail post={post} showEditButton={!!session?.user?.id} />;
};

export default PortfolioDetailPage;
