import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const reorderSchema = z.object({
  folderId: z.string(),
  documentIds: z.array(z.string()),
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
    const { folderId, documentIds } = reorderSchema.parse(body);

    // Verify that the folder exists
    const folder = await db.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    // Execute a transaction to update all documents in the correct order
    await db.$transaction(
      documentIds.map((documentId, index) => 
        db.document.update({
          where: { id: documentId },
          data: { 
            order: index,
            folderId: folderId, // Ensure the document is in the correct folder
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DOCUMENT_REORDER]", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}