// File: src/app/api/admin/folders/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, description, parentId } = body

    const folder = await db.folder.create({
      data: {
        name,
        description,
        ...(parentId && {
          parent: {
            connect: {
              id: parentId
            }
          }
        })
      },
      include: {
        parent: true,
        subFolders: true,
        documents: true
      }
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error("[FOLDERS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}