import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const documents = await db.document.findMany({
      where: {
        OR: [
          { type: "PERSONAL" },
          { type: "SHARED_ADMIN" }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error("[ADMIN_DOCUMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}