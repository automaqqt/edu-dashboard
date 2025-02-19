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
    const { title, content, fileUrl, isGlobal, teacherIds } = body

    // Validate required fields
    if (!title || !content) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // If not global, validate teacher IDs
    if (!isGlobal && (!teacherIds || teacherIds.length === 0)) {
      return new NextResponse("Teacher IDs required for targeted announcement", { status: 400 })
    }

    // Create announcement with proper relations
    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        fileUrl,
        isGlobal,
        user: {
          connect: {
            id: session.user.id
          }
        },
        ...((!isGlobal && teacherIds) && {
          recipients: {
            connect: teacherIds.map((id: string) => ({ id }))
          }
        })
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

    if (isGlobal) {
        await db.user.updateMany({
            where: {
              role: "TEACHER"
            },
            data: {
                hasNewAnnouncement: true
            }
          })
    }
    else {
        teacherIds.map(async (teacherId: string) => {
            await db.user.update({
                where: {
                  id: teacherId
                },
                data: {
                    hasNewAnnouncement: true
                }
              })
        })
    }

    return NextResponse.json(announcement)
  } catch (error) {
    console.error("[ANNOUNCEMENTS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const announcements = await db.announcement.findMany({
      where: {
        user: {
          role: "ADMIN"
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
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error("[ANNOUNCEMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}