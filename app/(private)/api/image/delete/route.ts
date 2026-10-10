import {
  destroyCloudinaryImage,
  initializeCloudinary,
} from "@/lib/cloudinary-lib";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { public_id }: { public_id: string } = await request.json();
  try {
    initializeCloudinary();
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message: `Initialize cloudinary error: ${error}`,
        },
      },
      { status: 400 }
    );
  }

  try {
    destroyCloudinaryImage([public_id]);

    return NextResponse.json(
      {
        data: {
          message: `Image with public id of ${public_id} has been deleted`,
        },
      },
      { status: 200 }
    );
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
