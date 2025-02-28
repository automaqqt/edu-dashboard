import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const reorderSchema = z.object({
  folderId: z.string(),
  direction: z.enum(["up", "down"]),
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
    const { folderId, direction } = reorderSchema.parse(body);

    // Find the folder
    const folder = await db.folder.findUnique({
      where: { id: folderId }
    });

    if (!folder) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    // Get all folders with the same parent, sorted by order
    const siblingFolders = await db.folder.findMany({
      where: {
        parentId: folder.parentId
      },
      orderBy: {
        ord: 'asc'
      }
    });


    // Find the current folder index
    const currentIndex = siblingFolders.findIndex((f: { id: string; }) => f.id === folderId);
    
    if (folder.ord === 0) {
        const maxOrderResult = await db.folder.aggregate({
            where: { parentId: folder.parentId },
            _max: { ord: true }
          });
      
          const newOrder = (maxOrderResult._max.ord ?? 0) + 1;
        await db.folder.update({
            where: { id: folderId },
            data: { ord: newOrder }
          });
    } else if (direction === "up" && currentIndex > 0) {
      // Swap with the folder above
      const folderAbove = siblingFolders[currentIndex - 1];
      
      await db.$transaction([
        db.folder.update({
          where: { id: folderId },
          data: { ord: folderAbove.ord }
        }),
        db.folder.update({
          where: { id: folderAbove.id },
          data: { ord: folder.ord ? folder.ord : 1 }
        })
      ]);
    } else if (direction === "down" && currentIndex < siblingFolders.length - 1) {
      // Swap with the folder below
      const folderBelow = siblingFolders[currentIndex + 1];
      await db.$transaction([
        db.folder.update({
          where: { id: folderId },
          data: { ord: folderBelow.ord }
        }),
        db.folder.update({
          where: { id: folderBelow.id },
          data: { ord: folder.ord }
        })
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FOLDER_REORDER_SINGLE]", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}