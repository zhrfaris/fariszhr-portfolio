import { getPostBySlug } from "@/actions/post/get";
import { hasUnlockedPost } from "@/lib/post-lock";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Public endpoint returning a post's sections. Mirrors the public page's lock:
 * a restricted post returns NO content (403) unless the caller holds a valid
 * signed unlock cookie (set by actions/post/unlock). Not gated behind login
 * because public visitors read posts without an account.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug);

    if (!post || post.status === "INACTIVE") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const sections = post.post_sections ?? [];

    if (post.isRestricted && !(await hasUnlockedPost(slug, post))) {
      return NextResponse.json({ error: "Locked" }, { status: 403 });
    }

    return NextResponse.json(sections, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: `Something went wrong: ${error}`,
        },
      },
      { status: 500 }
    );
  }
}
