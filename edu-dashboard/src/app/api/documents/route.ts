import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, fileUrl, fileSize, type } = body

    const document = await db.document.create({
      data: {
        title,
        fileUrl,
        fileSize,
        type: type || "PERSONAL",
        userId: session.user.id
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error("[DOCUMENTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const typeParam = searchParams.get("type")

    const documents = await db.document.findMany({
      where: {
        OR: [
          {
            type: "SHARED_ADMIN"
          },
          {
            userId: session.user.id,
            type: typeParam || "PERSONAL"
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error("[DOCUMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}