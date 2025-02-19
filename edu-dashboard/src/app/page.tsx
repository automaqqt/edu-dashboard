import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { LoginForm } from "@/components/auth/login-form"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-10 md:px-6 md:py-12 lg:py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Welcome to EduDashboard
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Your comprehensive platform for managing educational resources
          </p>
        </div>
        <div className="w-full max-w-[400px] rounded-lg border bg-card p-8 shadow-lg">
          
            
            <LoginForm />
        </div>
      </div>
    </main>
  )
}