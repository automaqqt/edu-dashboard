import { UserNav } from "./user-nav"
import { MobileSidebar } from "./mobile-sidebar"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-full relative">
      {/* Desktop Sidebar */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <main className="md:pl-72">
        <div className="flex-1 h-full">
          <div className="border-b">
            <div className="flex h-16 items-center px-4">
              <MobileSidebar />
              <div className="ml-auto flex items-center space-x-4 ">
                <UserNav />
              </div>
            </div>
          </div>
          <div className="p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}