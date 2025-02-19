import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get all folders with their documents and nested structure
    const folders = await db.folder.findMany({
      where: {
        parentId: null // Get root folders
      },
      include: {
        documents: {
          where: {
            type: "TRAINING"
          },
          orderBy: {
            updatedAt: 'desc'
          }
        },
        subFolders: {
          include: {
            documents: {
              where: {
                type: "TRAINING"
              },
              orderBy: {
                updatedAt: 'desc'
              }
            },
            subFolders: {
              include: {
                documents: {
                  where: {
                    type: "TRAINING"
                  },
                  orderBy: {
                    updatedAt: 'desc'
                  }
                },
                subFolders: {
                  include: {
                    documents: {
                      where: {
                        type: "TRAINING"
                      }
                    },
                    subFolders: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error("[TRAINING_FOLDERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}