import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { gruppenanzahl, teilnehmeranzahl } = body

    const user = await db.user.update({
      where: {
        id: session.user.id
      },
      data: {
        gruppenanzahl,
        teilnehmeranzahl
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USER_SETTINGS_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}