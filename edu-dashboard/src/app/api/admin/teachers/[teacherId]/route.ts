import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
    req: Request,
    { params }: { params: { teacherId: string } }
  ) {
    try {
      const session = await getServerSession(authOptions)
      
      if (session?.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
      }
  
      const body = await req.json()
      const { 
        isActive, 
        name, 
        email, 
        gruppenanzahl, 
        teilnehmeranzahl, 
        notes 
      } = body
  
      const teacher = await db.user.update({
        where: {
          id: params.teacherId
        },
        data: {
          isActive,
          name,
          email,
          gruppenanzahl,
          teilnehmeranzahl,
          notes
        }
      })
  
      return NextResponse.json(teacher)
    } catch (error) {
      console.error("[TEACHER_PATCH]", error)
      return new NextResponse("Internal Error", { status: 500 })
    }
  }

export async function DELETE(
  req: Request,
  { params }: { params: { teacherId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await db.user.delete({
      where: {
        id: params.teacherId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}