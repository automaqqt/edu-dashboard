import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-10 md:px-6 md:py-12 lg:py-16">
        {/* Logo at the top */}
        <div className="mb-2">
          <Image 
            src="/logo.webp" 
            alt="EduDashboard Logo" 
            width={420} 
            height={380}
            className="drop-shadow-lg"
          />
        </div>
        
        
        <div className="w-full max-w-[450px] rounded-xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-white">Anmeldung</h2>
            <p className="text-white/80 mt-1">Zugang zum Trainer Dashboard</p>
          </div>
          <LoginForm />
        </div>
        
        <div className="mt-8 flex gap-6">
          <div className="flex items-center rounded-lg bg-white/20 px-4 py-3 text-white backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Lernmaterial
          </div>
          <div className="flex items-center rounded-lg bg-white/20 px-4 py-3 text-white backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.669 0-3.218.51-4.5 1.385V12a1 1 0 11-2 0V4.804z" />
            </svg>
            Kontakt
          </div>
        </div>
      </div>
    </main>
  )
}