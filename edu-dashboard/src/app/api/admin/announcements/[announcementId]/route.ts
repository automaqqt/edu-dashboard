import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: { announcementId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await db.announcement.delete({
      where: {
        id: params.announcementId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[ANNOUNCEMENT_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { announcementId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, content, isGlobal, teacherIds } = body

    // Validate required fields
    if (!title || !content) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // If not global, validate teacher IDs
    if (!isGlobal && (!teacherIds || teacherIds.length === 0)) {
      return new NextResponse("Teacher IDs required for targeted announcement", { status: 400 })
    }

    // Update announcement
    const announcement = await db.announcement.update({
      where: {
        id: params.announcementId
      },
      data: {
        title,
        content,
        isGlobal,
        recipients: {
          set: isGlobal ? [] : teacherIds.map((id: string) => ({ id }))
        }
      },
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        },
        recipients: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error("[ANNOUNCEMENT_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}