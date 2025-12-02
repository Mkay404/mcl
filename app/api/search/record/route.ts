import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: true, recorded: false })
    }

    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
    }

    await supabase.from('search_history').insert({
      user_id: user.id,
      query: query.trim(),
    })

    return NextResponse.json({ success: true, recorded: true })
  } catch (error) {
    console.error('Search record update error:', error)
    return NextResponse.json({ error: 'Failed to record search' }, { status: 500 })
  }
}
