import { createClient } from '@/lib/supabase/server'
import AdminResource from '@/components/AdminResource'

export default async function ReviewsPage() {
  const supabase = await createClient()

  const { data: pendingFiles } = await supabase
    .from('resources')
    .select(
      `*, 
          courses(
          id,
          academic_levels(
          level_number
          )
          ),
          users:uploaded_by(email, username)`,
    )
    .eq('is_approved', false)
    .or("rejection_reason.is.null,rejection_reason.eq.''")
    .order('upload_date', { ascending: true })

  return <AdminResource initialResources={pendingFiles || []} />
}
