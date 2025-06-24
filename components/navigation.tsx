"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { Upload, User, LogOut, Menu, X, Skull, Home } from "lucide-react"
import UploadModal from "@/components/upload-modal"

export default function Navigation() {
  const { user, signOut } = useAuth()
  const [showUpload, setShowUpload] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <nav className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Skull className="w-8 h-8 text-red-500" />
              <h1 className="text-xl font-bold text-white">CreepyGallery</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                <Home className="w-4 h-4 mr-2" />
                Gallery
              </Button>

              <Button onClick={() => setShowUpload(true)} className="bg-red-900 hover:bg-red-800 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || "/placeholder.svg"} alt={user?.displayName || ""} />
                      <AvatarFallback className="bg-gray-700 text-white">
                        {user?.displayName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white">{user?.displayName}</p>
                      <p className="w-[200px] truncate text-sm text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-800" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-800 py-4">
              <div className="flex flex-col space-y-2">
                <Button variant="ghost" className="justify-start text-gray-300 hover:text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Gallery
                </Button>

                <Button
                  onClick={() => {
                    setShowUpload(true)
                    setMobileMenuOpen(false)
                  }}
                  className="justify-start bg-red-900 hover:bg-red-800 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>

                <div className="border-t border-gray-800 pt-2 mt-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || "/placeholder.svg"} alt={user?.displayName || ""} />
                      <AvatarFallback className="bg-gray-700 text-white">
                        {user?.displayName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white text-sm">{user?.displayName}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                  </div>

                  <Button variant="ghost" className="justify-start text-gray-300 hover:text-white w-full">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>

                  <Button
                    variant="ghost"
                    className="justify-start text-gray-300 hover:text-white w-full"
                    onClick={signOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} />
    </>
  )
}
