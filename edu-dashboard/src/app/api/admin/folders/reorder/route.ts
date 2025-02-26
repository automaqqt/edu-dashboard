import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const reorderSchema = z.object({
  parentId: z.string(),
  folderIds: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Parse and validate the request body
    const body = await req.json();
    const { parentId, folderIds } = reorderSchema.parse(body);

    // Check if we're reordering root folders (parentId === "root")
    const parentIdForDB = parentId === "root" ? null : parentId;

    // Execute a transaction to update all folders in the correct order
    await db.$transaction(
      folderIds.map((folderId, index) => 
        db.folder.update({
          where: { id: folderId },
          data: { 
            order: index,
            // If we're reordering root folders or moving folders to a new parent
            ...(parentIdForDB !== undefined && { parentId: parentIdForDB }),
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FOLDER_REORDER]", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}