import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'
export const alt = 'Department Page'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

interface ImageProps {
  params: Promise<{ facultyId: string; departmentId: string }>
}

export default async function Image(props: ImageProps) {
  const params = await props.params
  const { facultyId, departmentId } = params

  const supabase = await createClient()

  const [facultyResult, deptResult] = await Promise.all([
    supabase.from('faculties').select('short_name, full_name').eq('id', facultyId).single(),
    supabase
      .from('departments')
      .select('short_name, full_name, description')
      .eq('id', departmentId)
      .eq('faculty_id', facultyId)
      .single(),
  ])

  const faculty = facultyResult.data
  const dept = deptResult.data

  const departmentName = dept?.full_name || 'Department'
  const shortName = dept?.short_name || ''
  const description = dept?.description || 'Explore academic levels'
  const facultyName = faculty?.full_name || 'Faculty'

  // Fetch logo
  let logoSvg = ''
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const logoResponse = await fetch(`${baseUrl}/logo.svg`)
    if (logoResponse.ok) {
      logoSvg = await logoResponse.text()
    }
  } catch (error) {
    // Fallback if logo fetch fails - will show white box instead
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header with branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '60px',
          }}
        >
          {logoSvg && (
            <img
              src={`data:image/svg+xml,${encodeURIComponent(logoSvg)}`}
              alt="Logo"
              width="48"
              height="48"
              style={{
                marginRight: '16px',
                borderRadius: '50%',
              }}
            />
          )}
          <div
            style={{
              fontSize: '24px',
              color: '#64748b',
              fontWeight: '600',
            }}
          >
            My Campus Library
          </div>
        </div>

        {/* Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
            fontSize: '18px',
            color: '#94a3b8',
          }}
        >
          <span>{facultyName}</span>
          <span style={{ margin: '0 12px' }}>/</span>
          <span style={{ color: '#64748b', fontWeight: '500' }}>Department</span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                color: '#0256a5',
                backgroundColor: '#e6f2ff',
                padding: '8px 16px',
                borderRadius: '6px',
                marginRight: '16px',
                fontWeight: '500',
              }}
            >
              Department
            </div>
            {shortName && (
              <div
                style={{
                  fontSize: '18px',
                  color: '#94a3b8',
                  fontWeight: '500',
                }}
              >
                {shortName}
              </div>
            )}
          </div>

          <h1
            style={{
              fontSize: '64px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 32px 0',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
            }}
          >
            {departmentName}
          </h1>

          <p
            style={{
              fontSize: '28px',
              color: '#475569',
              lineHeight: '1.6',
              margin: '0',
              maxWidth: '900px',
            }}
          >
            {description.length > 140 ? `${description.substring(0, 140)}...` : description}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingTop: '40px',
            borderTop: '1px solid #e2e8f0',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ marginRight: '8px' }}>📖</span>
            <span>Browse academic levels</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
