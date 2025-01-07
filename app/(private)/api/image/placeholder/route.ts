import { NextResponse } from "next/server";
import { getPlaiceholder } from "plaiceholder";

export async function POST(request: Request) {
  const { image_url }: { image_url: string } = await request.json();

  try {
    const buffer = await fetch(image_url).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    );

    const { base64 } = await getPlaiceholder(buffer);

    return NextResponse.json({ base64 }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: `Could not delete image: ${error}`,
        },
      },
      { status: 400 }
    );
  }
}
