import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
    params: Promise<{ attemptId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { attemptId } = await params
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get attempt info first
        const { data: attempt, error: attemptError } = await supabase
            .from('cbt_attempts')
            .select(
                `
        *,
        cbts(
          id,
          title,
          passing_score,
          courses(
            id,
            course_code,
            course_title
          )
        )
      `,
            )
            .eq('id', attemptId)
            .eq('user_id', user.id)
            .single()

        if (attemptError || !attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
        }

        if (!attempt.completed_at) {
            return NextResponse.json({ error: 'Attempt is not yet completed' }, { status: 400 })
        }

        // Get the review using the RPC function
        const { data: review, error: reviewError } = await supabase.rpc('get_attempt_review', {
            p_attempt_id: attemptId,
        })

        if (reviewError) throw reviewError

        return NextResponse.json({
            attempt,
            review,
        })
    } catch (error) {
        console.error('Error fetching review:', error)
        return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 })
    }
}
