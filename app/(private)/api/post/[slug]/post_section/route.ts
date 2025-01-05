import { getPostSectionsBySlug } from "@/actions/post/get";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const post_sections = await getPostSectionsBySlug(slug);

    return NextResponse.json(post_sections, { status: 200 });
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
