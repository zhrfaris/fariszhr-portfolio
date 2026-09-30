import { getPostBySlug } from "@/actions/post/get";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Public endpoint returning a post's sections. This mirrors the passcode gating
 * enforced by the public portfolio page: for a restricted post, only the preview
 * sections are returned unless the caller holds a valid `unlocked_<slug>` cookie
 * (set by verifyPostPasscode). This prevents the full restricted content from
 * being fetched directly via the API to bypass the passcode. It is NOT gated
 * behind login because public visitors read posts without an account.
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

    if (post.isRestricted) {
      const cookieStore = await cookies();
      const isUnlocked =
        cookieStore.get(`unlocked_${slug}`)?.value === "true";

      if (!isUnlocked) {
        const preview = sections.slice(0, post.previewSectionAmount || 3);
        return NextResponse.json(preview, { status: 200 });
      }
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
