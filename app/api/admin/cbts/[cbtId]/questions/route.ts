import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

interface RouteParams {
    params: Promise<{ cbtId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { cbtId } = await params
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

        const { data: questions, error } = await supabaseAdmin
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
            .eq('cbt_id', cbtId)
            .order('order_index', { ascending: true })

        if (error) throw error

        return NextResponse.json(questions)
    } catch (error) {
        console.error('Error fetching questions:', error)
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }
}

export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { cbtId } = await params
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

        if (!questionText || !questionType) {
            return NextResponse.json(
                { error: 'Question text and type are required' },
                { status: 400 },
            )
        }

        if (!options || options.length < 2) {
            return NextResponse.json(
                { error: 'At least 2 options are required' },
                { status: 400 },
            )
        }

        const hasCorrectAnswer = options.some((opt: { isCorrect: boolean }) => opt.isCorrect)
        if (!hasCorrectAnswer) {
            return NextResponse.json(
                { error: 'At least one option must be marked as correct' },
                { status: 400 },
            )
        }

        // Get the next order index
        const { data: lastQuestion } = await supabaseAdmin
            .from('questions')
            .select('order_index')
            .eq('cbt_id', cbtId)
            .order('order_index', { ascending: false })
            .limit(1)
            .single()

        const nextOrderIndex = lastQuestion ? lastQuestion.order_index + 1 : 0

        // Insert the question
        const { data: question, error: questionError } = await supabaseAdmin
            .from('questions')
            .insert({
                cbt_id: cbtId,
                question_text: questionText,
                question_type: questionType,
                points: points || 1,
                explanation: explanation || null,
                shuffle_options: shuffleOptions || false,
                order_index: nextOrderIndex,
            })
            .select()
            .single()

        if (questionError) throw questionError

        // Insert the options
        const optionsToInsert = options.map(
            (opt: { optionText: string; isCorrect: boolean }, index: number) => ({
                question_id: question.id,
                option_text: opt.optionText,
                is_correct: opt.isCorrect,
                order_index: index,
            }),
        )

        const { error: optionsError } = await supabaseAdmin
            .from('question_options')
            .insert(optionsToInsert)

        if (optionsError) throw optionsError

        // Return the question with options
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
            .eq('id', question.id)
            .single()

        if (fetchError) throw fetchError

        return NextResponse.json(fullQuestion, { status: 201 })
    } catch (error) {
        console.error('Error creating question:', error)
        return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
    }
}
