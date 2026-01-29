import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

interface RouteParams {
    params: Promise<{ cbtId: string; questionId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { cbtId, questionId } = await params
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { data: question, error } = await supabaseAdmin
            .from('questions')
            .select(
                `
        *,
        question_options(
          id,
          option_text,
          is_correct,
          order_index
        )
      `,
            )
            .eq('id', questionId)
            .eq('cbt_id', cbtId)
            .single()

        if (error) throw error
        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 })
        }

        return NextResponse.json(question)
    } catch (error) {
        console.error('Error fetching question:', error)
        return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { cbtId, questionId } = await params
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { questionText, questionType, points, explanation, options, shuffleOptions } =
            await request.json()

        // Update question
        const questionUpdates: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        }

        if (questionText !== undefined) questionUpdates.question_text = questionText
        if (questionType !== undefined) questionUpdates.question_type = questionType
        if (points !== undefined) questionUpdates.points = points
        if (explanation !== undefined) questionUpdates.explanation = explanation
        if (shuffleOptions !== undefined) questionUpdates.shuffle_options = shuffleOptions

        const { error: questionError } = await supabaseAdmin
            .from('questions')
            .update(questionUpdates)
            .eq('id', questionId)
            .eq('cbt_id', cbtId)

        if (questionError) throw questionError

        // If options are provided, update them
        if (options && options.length > 0) {
            // Delete existing options
            await supabaseAdmin.from('question_options').delete().eq('question_id', questionId)

            // Insert new options
            const optionsToInsert = options.map(
                (opt: { optionText: string; isCorrect: boolean }, index: number) => ({
                    question_id: questionId,
                    option_text: opt.optionText,
                    is_correct: opt.isCorrect,
                    order_index: index,
                }),
            )

            const { error: optionsError } = await supabaseAdmin
                .from('question_options')
                .insert(optionsToInsert)

            if (optionsError) throw optionsError
        }

        // Return the updated question with options
        const { data: fullQuestion, error: fetchError } = await supabaseAdmin
            .from('questions')
            .select(
                `
        *,
        question_options(
          id,
          option_text,
          is_correct,
          order_index
        )
      `,
            )
            .eq('id', questionId)
            .single()

        if (fetchError) throw fetchError

        return NextResponse.json(fullQuestion)
    } catch (error) {
        console.error('Error updating question:', error)
        return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { cbtId, questionId } = await params
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { error } = await supabaseAdmin
            .from('questions')
            .delete()
            .eq('id', questionId)
            .eq('cbt_id', cbtId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting question:', error)
        return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
    }
}
