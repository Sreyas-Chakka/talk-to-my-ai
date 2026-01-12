'use client'

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import RecruitmentAssistant from "@/components/RecruitmentAssistant"

export default function RecruitmentPage() {
  const router = useRouter()
  const { isLoaded, userId } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (isLoaded && !userId && !isRedirecting) {
      setIsRedirecting(true)
      router.push("/sign-in")
    }
  }, [isLoaded, userId, router, isRedirecting])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="text-white text-xl">Redirecting to sign in...</div>
      </div>
    )
  }

  return <RecruitmentAssistant />
}
