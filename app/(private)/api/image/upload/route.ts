import {
  uploadCloudinaryImage,
  initializeCloudinary,
} from "@/lib/cloudinary-lib";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { filePath }: { filePath: string } = await request.json();
  try {
    initializeCloudinary();
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: `Initialize cloudinary error: ${error}`,
        },
      },
      { status: 500 }
    );
  }

  try {
    const image = await uploadCloudinaryImage(filePath);

    return NextResponse.json({ data: { image } }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: `Failed to upload image: ${error}`,
        },
      },
      { status: 500 }
    );
  }
}
