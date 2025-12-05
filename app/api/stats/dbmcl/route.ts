import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const { count: resourceCount } = await supabaseAdmin
      .from('resources')
      .select('*', { count: 'exact', head: true })

    const { count: userCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: downloadCount } = await supabaseAdmin
      .from('download_history')
      .select('*', { count: 'exact', head: true })

    const { count: viewCount } = await supabaseAdmin
      .from('view_history')
      .select('*', { count: 'exact', head: true })

    const { count: pendingCount } = await supabaseAdmin
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false) // pending reviews

    return NextResponse.json({
      resourceCount,
      userCount,
      downloadCount,
      viewCount,
      pendingCount,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
