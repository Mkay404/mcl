'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Course {
  id: number
  course_code: string
  course_title: string
  description: string
}

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const facultyId = params.facultyId as string
  const departmentId = params.departmentId as string
  const levelId = params.levelId as string
  const courseId = params.courseId as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    course_code: '',
    course_title: '',
    description: '',
  })

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          cache: 'no-store',
        })
        if (!response.ok) throw new Error('Failed to fetch course')

        const data: Course = await response.json()
        setFormData({
          course_code: data.course_code,
          course_title: data.course_title,
          description: data.description,
        })
      } catch (error) {
        console.error(error)
        toast.error('Failed to load course')
        router.push(
          `/admin/faculties/${facultyId}/departments/${departmentId}/levels/${levelId}/courses`,
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, facultyId, departmentId, levelId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Success', {
          description: 'Course updated successfully',
        })
        router.push(
          `/admin/faculties/${facultyId}/departments/${departmentId}/levels/${levelId}/courses`,
        )
      } else {
        const error = await response.json()
        toast.error('Error', {
          description: error.error || 'Failed to update course',
        })
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while updating the course')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <Link
            href={`/admin/faculties/${facultyId}/departments/${departmentId}/levels/${levelId}/courses`}
          >
            <span className="flex text-sm mb-4 text-primary items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </span>
          </Link>
          <h1 className="text-2xl font-bold">Edit Course</h1>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course_code">
                  Course Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="course_code"
                  placeholder="e.g., GST201"
                  value={formData.course_code}
                  onChange={e => setFormData({ ...formData, course_code: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course_title">
                  Course Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="course_title"
                  placeholder="e.g., Applied Mathematics"
                  value={formData.course_title}
                  onChange={e => setFormData({ ...formData, course_title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Course description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
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
