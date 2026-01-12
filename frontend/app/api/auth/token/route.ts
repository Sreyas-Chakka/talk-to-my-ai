import { getAuth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { getToken } = getAuth(req)
    const token = await getToken()
    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get token' }, { status: 401 })
  }
}
