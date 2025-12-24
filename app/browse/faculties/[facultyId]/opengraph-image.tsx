import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'
export const alt = 'Faculty Page'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

interface ImageProps {
  params: Promise<{ facultyId: string }>
}

export default async function Image(props: ImageProps) {
  const params = await props.params
  const { facultyId } = params

  const supabase = await createClient()
  const { data: faculty } = await supabase
    .from('faculties')
    .select('full_name, short_name, description')
    .eq('id', facultyId)
    .single()

  const facultyName = faculty?.full_name || 'Faculty'
  const shortName = faculty?.short_name || ''
  const description = faculty?.description || 'Explore departments and courses'

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
              Faculty
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
            {facultyName}
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
            <span style={{ marginRight: '8px' }}>🏛️</span>
            <span>Explore departments and courses</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
