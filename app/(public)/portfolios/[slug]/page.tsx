import React from "react";
import PortfolioDetail from "@/components/portfolio-detail/portfolio-detail";
import {
  getPortfolioBySlug,
  getPostForMetadata,
  getPostSlugsShowCase,
} from "@/actions/post/get";
import { notFound, redirect } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { MAIN_USERNAME } from "@/lib/db";
import { cookies } from "next/headers";
import { getUser } from "@/actions/user/get";
import PasscodeForm from "@/components/portfolio-detail/passcode-form";

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
  parent: ResolvingMetadata,
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
  // const session = await auth();

  const post = await getPortfolioBySlug(slug);

  if (!post || post.status === "INACTIVE") {
    notFound();
  }

  if (post.post_sections.length === 0) {
    redirect("/coming-soon");
  }

  // --- SECURE GUARD WITH PREVIEW ---
  if (post.isRestricted) {
    const user = await getUser();
    const cookieStore = await cookies();
    const isUnlocked = cookieStore.get(`unlocked_${slug}`)?.value === "true";

    if (!isUnlocked) {
      // 1. Create a safe preview version of the post.
      // For example, only take the first 2 sections of the article:
      const previewPost = {
        ...post,
        post_sections: post.post_sections.slice(
          0,
          post.previewSectionAmount || 3,
        ),
      };

      // 2. Render the partial detail view AND the passcode form below it
      return (
        <div className="relative">
          {/* Renders only the first 2 sections safely */}
          <PortfolioDetail post={previewPost} />

          {/* Overlay or bottom banner with the passcode form */}
          <div className="h-[90vh] md:h-[80vh] px-4 absolute bottom-0 inset-x-0 w-full flex items-center justify-center bg-gradient-to-t from-white via-[#ffffff90] to-transparent mb-[4rem]">
            <PasscodeForm slug={slug} user={user} />
          </div>
        </div>
      );
    }
  }

  // return <PortfolioDetail post={post} slug={slug} />;
  return <PortfolioDetail post={post} />;
};

export default PortfolioDetailPage;
