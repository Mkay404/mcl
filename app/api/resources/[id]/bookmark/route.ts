import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: resourceId } = await params

    const { data: existing } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('resource_id', resourceId)
      .single()

    if (existing) {
      await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('resource_id', resourceId)

      return NextResponse.json({ bookmarked: false })
    } else {
      await supabase.from('user_bookmarks').insert({
        user_id: user.id,
        resource_id: resourceId,
      })

      return NextResponse.json({ bookmarked: true })
    }
  } catch (error) {
    console.error('Bookmark error:', error)
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 })
  }
}
