// Enhanced teacher filtering component
import { useState, useMemo } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  name: string
  email: string
}

interface TeacherFilterProps {
  users: User[]
  selectedUserId: string | null
  onChange: (userId: string | null) => void
}

export function TeacherFilter({ users, selectedUserId, onChange }: TeacherFilterProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.name.localeCompare(b.name))
  }, [users])
  
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return sortedUsers
    
    return sortedUsers.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [sortedUsers, searchQuery])
  
  const selectedTeacher = users.find(u => u.id === selectedUserId)
  
  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[220px] justify-between">
            {selectedUserId ? (
              <div className="flex items-center gap-2 max-w-[180px] overflow-hidden">
                <span className="truncate">{selectedTeacher?.name}</span>
              </div>
            ) : (
              "All Teachers"
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[220px]" align="start">
          <div className="px-2 py-2">
            <Input
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className="justify-between"
          >
            All Teachers
            {selectedUserId === null && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[200px]">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <DropdownMenuItem
                  key={user.id}
                  onClick={() => {
                    onChange(user.id)
                    setOpen(false)
                  }}
                  className="justify-between"
                >
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  {selectedUserId === user.id && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="text-center py-2 text-sm text-muted-foreground">
                No teachers found
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {selectedUserId && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-10 top-0"
          onClick={() => onChange(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}