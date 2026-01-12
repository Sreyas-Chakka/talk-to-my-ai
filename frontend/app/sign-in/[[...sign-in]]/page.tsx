'use client'

import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Voice Demo</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          <SignIn 
            routing="path" 
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/"
            afterSignUpUrl="/"
          />
        </div>
      </div>
    </div>
  )
}
