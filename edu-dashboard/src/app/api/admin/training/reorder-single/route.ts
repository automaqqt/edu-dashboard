import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const reorderSchema = z.object({
  documentId: z.string(),
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
    const { documentId, direction } = reorderSchema.parse(body);

    // Find the document and its folder
    const document = await db.document.findUnique({
      where: { id: documentId },
      include: {
        folder: true
      }
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }
    if (!document.folder) {
        return new NextResponse("Document has no folder attafched", { status: 404 });
      }
    const folderId = document.folder.id;
    // Get all documents in the same folder, sorted by ord
    const documentsInFolder = await db.document.findMany({
      where: {
        folder: {
          id: folderId
        }
      },
      orderBy: {
        ord: 'asc'
      }
    });
    // Find the current document index
    if (document.ord === 0) {
        const maxOrderResult = await db.document.aggregate({
            where: { folderId: folderId },
            _max: { ord: true }
          });
      
          const newOrder = (maxOrderResult._max.ord ?? 0) + 1;
        await db.document.update({
            where: { id: documentId },
            data: { ord: newOrder }
          });
    } else if (direction === "up" && document.ord > 1) {
      // Swap with the document above
      const documentAbove = documentsInFolder[document.ord - 2];
      
      await db.$transaction([
        db.document.update({
          where: { id: documentId },
          data: { ord: documentAbove.ord }
        }),
        db.document.update({
          where: { id: documentAbove.id },
          data: { ord: document.ord }
        })
      ]);
    } else if (direction === "down" && document.ord < documentsInFolder.length) {
      // Swap with the document below
      const documentBelow = documentsInFolder[document.ord];
      
      await db.$transaction([
        db.document.update({
          where: { id: documentId },
          data: { ord: documentBelow.ord }
        }),
        db.document.update({
          where: { id: documentBelow.id },
          data: { ord: document.ord }
        })
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DOCUMENT_REORDER_SINGLE]", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}