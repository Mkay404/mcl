import AdminStats from '@/components/AdminStats'

export default async function AdminPage() {
  
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Campus Library Management</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <AdminStats />
    </div>
  )
}
