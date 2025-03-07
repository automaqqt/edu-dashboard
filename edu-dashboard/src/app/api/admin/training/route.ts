import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import fs from "fs"
import path from "path"

export async function POST(req: Request) {
    try {
      const session = await getServerSession(authOptions)
      
      if (session?.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
      }
  
      const body = await req.json()
      const { title, fileUrl, folderId, skillLevel, requirements } = body
  
      // Validate requirements length if provided
      if (requirements && requirements.length > 40) {
        return new NextResponse("Requirements must be max 40 characters", { 
          status: 400 
        })
      }
  
      // Get file size from the uploaded file - updated path
      const fileName = fileUrl.split('/').pop()
      const filePath = path.join('/var/www/uploads', fileName)
      const stats = fs.statSync(filePath)
      const fileSize = stats.size
  
      const document = await db.document.create({
        data: {
          title,
          fileUrl,
          fileSize,
          type: "TRAINING",
          skillLevel: skillLevel || 1,
          requirements,
          user: {
            connect: {
              id: session.user.id
            }
          },
          ...(folderId && {
            folder: {
              connect: {
                id: folderId
              }
            }
          })
        },
        include: {
          folder: true
        }
      })
  
      return NextResponse.json(document)
    } catch (error) {
      console.error("[TRAINING_POST]", error)
      return new NextResponse("Internal Error", { status: 500 })
    }
  }

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const documents = await db.document.findMany({
      where: {
        type: "TRAINING"
      },
      orderBy: {
        updatedAt: "desc"
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error("[TRAINING_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}