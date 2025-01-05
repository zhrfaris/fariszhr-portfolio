import {
  uploadCloudinaryImage,
  initializeCloudinary,
} from "@/lib/cloudinary-lib";
import { convertFileToBase64 } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image");

  if (!file) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  const base64 = await convertFileToBase64(file);

  console.log(base64);

  if (base64.length === 0) {
    return NextResponse.json(
      { error: "Failed to convert file to base64" },
      { status: 400 }
    );
  }

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
