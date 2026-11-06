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
import { hasUnlockedPost } from "@/lib/post-lock";
import { getUser } from "@/actions/user/get";
import PasscodeForm from "@/components/portfolio-detail/passcode-form";
import LockedContent from "@/components/portfolio-detail/locked-content";

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

  // Never hand the stored password (or the old preview setting) to the page.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHashed, previewSectionAmount, ...publicPost } = post;

  // Restricted post: without a valid signed unlock cookie, the server sends
  // only the header (cover, categories, title). No Content leaves the server.
  if (post.isRestricted && !(await hasUnlockedPost(slug, post))) {
    const user = await getUser();
    const lockedPost = {
      ...publicPost,
      post_sections: [],
    } as unknown as NonNullable<typeof post>;

    return (
      <PortfolioDetail
        post={lockedPost}
        lockedSlot={
          <LockedContent>
            <PasscodeForm slug={slug} email={user?.email} />
          </LockedContent>
        }
      />
    );
  }

  return <PortfolioDetail post={publicPost as NonNullable<typeof post>} />;
};

export default PortfolioDetailPage;
