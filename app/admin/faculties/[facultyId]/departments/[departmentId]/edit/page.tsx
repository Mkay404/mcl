'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface Department {
  id: number
  full_name: string
  short_name: string
  description: string
}

export default function EditDepartmentPage() {
  const params = useParams()
  const router = useRouter()
  const facultyId = params.facultyId as string
  const departmentId = params.departmentId as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    shortName: '',
    description: '',
  })

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await fetch(`/api/admin/departments/${departmentId}`, {
          cache: 'no-store',
        })
        if (!response.ok) throw new Error('Failed to fetch department')

        const data: Department = await response.json()
        setFormData({
          fullName: data.full_name,
          shortName: data.short_name,
          description: data.description,
        })
      } catch (error) {
        console.error(error)
        toast.error('Failed to load department')
        router.push(`/admin/faculties/${facultyId}/departments`)
      } finally {
        setLoading(false)
      }
    }

    fetchDepartment()
  }, [departmentId, facultyId, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    if (!formData.fullName || !formData.shortName || !formData.description) {
      toast.error('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/departments/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Success', {
          description: 'Department updated successfully',
        })
        router.push(`/admin/faculties/${facultyId}/departments`)
      } else {
        const error = await response.json()
        toast.error('Error', {
          description: error.error || 'Failed to update department',
        })
      }
    } catch (error) {
      console.error('Error updating department:', error)
      toast.error('An error occurred while updating the department')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <Link href={`/admin/faculties/${facultyId}/departments`}>
            <span className="flex text-sm mb-4 text-primary items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Departments
            </span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Department</h1>
            <p className="text-sm text-muted-foreground">Update department information</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Department Details</CardTitle>
            <CardDescription>Edit the information for this department</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="dept-fullname">
                  Department Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dept-fullname"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g., Mechatronics Engineering"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dept-shortname">
                  Department Short Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dept-shortname"
                  value={formData.shortName}
                  onChange={e => setFormData({ ...formData, shortName: e.target.value })}
                  placeholder="e.g., MTE"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Brief description of the department..."
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
