import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const moveSchema = z.object({
  folderId: z.string(),
  newParentId: z.string().nullable(),
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
    const { folderId, newParentId } = moveSchema.parse(body);

    // Convert "root" to null for database
    const parentIdForDB = newParentId === "root" ? null : newParentId;

    // Verify that the folder exists
    const folder = await db.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    // If not moving to root, verify that the new parent folder exists
    if (parentIdForDB) {
      const newParent = await db.folder.findUnique({
        where: { id: parentIdForDB },
      });

      if (!newParent) {
        return new NextResponse("Parent folder not found", { status: 404 });
      }

      // Check for circular references - don't allow moving a folder into one of its descendants
      let currentParentId = newParent.parentId;
      while (currentParentId) {
        if (currentParentId === folderId) {
          return new NextResponse("Cannot move a folder into its own descendant", { status: 400 });
        }
        
        const parent = await db.folder.findUnique({
          where: { id: currentParentId },
          select: { parentId: true }
        });
        
        if (!parent) break;
        currentParentId = parent.parentId;
      }
    }


    // Update the folder
    await db.folder.update({
      where: { id: folderId },
      data: { 
        ...(parentIdForDB 
          ? { 
              parent: {
                connect: { id: parentIdForDB }
              } 
            } 
          : { 
              parent: {
                disconnect: true
              } 
            }
        )
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FOLDER_MOVE]", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}