import {
  uploadCloudinaryImage,
  initializeCloudinary,
} from "@/lib/cloudinary-lib";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { base64 }: { base64: string } = await request.json();

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
    const image = await uploadCloudinaryImage(base64);

    return NextResponse.json({ image }, { status: 200 });
  } catch (error) {
    console.log(error);
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
