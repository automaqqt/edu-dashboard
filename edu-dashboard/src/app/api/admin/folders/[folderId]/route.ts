import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function DELETE(req: Request, { params }: { params: { folderId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { folderId } = params;

    // Check if the folder exists
    const folder = await db.folder.findUnique({
      where: { id: folderId },
      include: {
        documents: true,
        subFolders: {
          include: {
            documents: true,
          },
        },
      },
    });

    if (!folder) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    // Delete the folder and all its contents (cascading delete should handle this)
    await db.folder.delete({
      where: { id: folderId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FOLDER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

const editFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  description: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { folderId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { folderId } = params;

    // Parse and validate the request body
    const body = await req.json();
    const { name, description } = editFolderSchema.parse(body);

    // Check if the folder exists
    const folder = await db.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    // Update the folder
    const updatedFolder = await db.folder.update({
      where: { id: folderId },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("[FOLDER_EDIT]", error);

    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    return new NextResponse("Internal Error", { status: 500 });
  }
}
