import React from 'react'
import Sidebar from './sidebar'
import Topbar from './topbar'

export default function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 