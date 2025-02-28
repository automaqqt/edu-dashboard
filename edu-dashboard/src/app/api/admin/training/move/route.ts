import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const moveSchema = z.object({
  documentId: z.string(),
  targetFolderId: z.string(),
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
    const { documentId, targetFolderId } = moveSchema.parse(body);

    // Verify that both the document and target folder exist
    const document = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    const targetFolder = await db.folder.findUnique({
      where: { id: targetFolderId },
    });

    if (!targetFolder) {
      return new NextResponse("Target folder not found", { status: 404 });
    }

    // Get the maximum order value in the target folder
    const maxOrderResult = await db.document.aggregate({
      where: { folderId: targetFolderId },
      _max: { ord: true }
    });

    const newOrder = (maxOrderResult._max.ord ?? -1) + 1;

    // Move the document to the target folder
    await db.document.update({
      where: { id: documentId },
      data: { 
        folder: {
          connect: { id: targetFolderId }
        },
        ord: newOrder
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DOCUMENT_MOVE]", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}