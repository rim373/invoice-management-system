"use client"
import { useState } from "react"
import { Edit, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
interface HeaderProps {
  userRole: "admin" | "user"
  userData: any
  onLogout: () => void
  
}

export function Header({ userRole, userData, onLogout }: HeaderProps) {
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false)
  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Good Morning, {userData?.name} ✨</h1>
          <div className="flex items-center space-x-4">
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 lg:h-auto lg:w-auto lg:px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData?.image || "/placeholder.svg"} alt={userData?.name} />
                    <AvatarFallback>
                      {userData?.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only lg:not-sr-only ml-2">{userData?.name}</span>
                </Button>
                
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  
                  onClick={() => setOpenPasswordDialog(true)}
                  className="flex items-center"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Password</span>
                
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600 flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        </div>
      <Dialog open={openPasswordDialog} onOpenChange={setOpenPasswordDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            // 🔒 TODO: handle password change logic
            setOpenPasswordDialog(false)
          }}
          className="space-y-4"
        >
          <Input type="password" placeholder="Current Password" required />
          <Input type="password" placeholder="New Password" required />
          <Input type="password" placeholder="Confirm New Password" required />
          <Button type="submit" className="w-full">
            Update Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>

      

      
        

        
    
    </header>
  )
}
