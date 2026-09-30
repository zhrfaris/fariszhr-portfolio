import {
  uploadCloudinaryImage,
  initializeCloudinary,
} from "@/lib/cloudinary-lib";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image");

  // `convertFileToBase64` relies on the browser-only FileReader API, which does
  // not exist in the Node server runtime, so we build the data URI here with a
  // Buffer instead. Cloudinary's unsigned_upload also requires the full
  // `data:<mime>;base64,...` prefix (not a bare base64 string).
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  let dataUri: string;
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    const mime = file.type || "image/png";
    dataUri = `data:${mime};base64,${bytes.toString("base64")}`;
  } catch (error) {
    return NextResponse.json(
      { error: { message: `Failed to read file: ${error}` } },
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
    const image = await uploadCloudinaryImage(dataUri);

    if (!image) {
      return NextResponse.json(
        { error: { message: "Upload failed: missing Cloudinary preset" } },
        { status: 500 }
      );
    }

    return NextResponse.json({ image }, { status: 200 });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : String(error);
    return NextResponse.json(
      {
        error: {
          message: `Failed to upload image: ${message}`,
        },
      },
      { status: 500 }
    );
  }
}
