import { Suspense } from "react"
import LandingPage from "@/components/landing-page"
import { AuthProvider } from "@/components/auth-provider"

export default function Home() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <LandingPage />
      </Suspense>
    </AuthProvider>
  )
}
