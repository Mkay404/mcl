import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
    params: Promise<{ attemptId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { attemptId } = await params
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify the attempt belongs to the user and is not completed
        const { data: attempt, error: attemptError } = await supabase
            .from('cbt_attempts')
            .select('id, completed_at')
            .eq('id', attemptId)
            .eq('user_id', user.id)
            .single()

        if (attemptError || !attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
        }

        if (attempt.completed_at) {
            return NextResponse.json({ error: 'Attempt is already completed' }, { status: 400 })
        }

        // Calculate the score using the RPC function
        const { error: scoreError } = await supabase.rpc('calculate_attempt_score', {
            p_attempt_id: attemptId,
        })

        if (scoreError) throw scoreError

        // Fetch the updated attempt with score
        const { data: updatedAttempt, error: fetchError } = await supabase
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
            .single()

        if (fetchError) throw fetchError

        return NextResponse.json(updatedAttempt)
    } catch (error) {
        console.error('Error submitting attempt:', error)
        return NextResponse.json({ error: 'Failed to submit attempt' }, { status: 500 })
    }
}
