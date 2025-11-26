import { render, screen, fireEvent } from '@testing-library/react'
import { ResourceCarousel } from '@/components/ResourceCarousel'
import '@testing-library/jest-dom'

beforeAll(() => {
  HTMLElement.prototype.scrollBy = vi.fn()
})

describe('ResourceCarousel', () => {
  const mockResources = [
    {
      id: '1',
      title: 'PDF File',
      file_type: 'pdf',
      downloads: 10,
      created_at: '2025-11-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Word Document',
      file_type: 'document',
      downloads: 5,
      created_at: '2025-11-02T00:00:00.000Z',
    },
    {
      id: '3',
      title: 'Presentation File',
      file_type: 'presentation',
      downloads: 2,
      created_at: '2025-11-03T00:00:00.000Z',
    },
    {
      id: '4',
      title: 'Video File',
      file_type: 'video',
      downloads: 7,
      created_at: '2025-11-04T00:00:00.000Z',
    },
  ]

  it('renders title and number of resources', () => {
    render(
      <ResourceCarousel
        title="Test Carousel"
        fileType="pdf"
        resources={mockResources}
        facultyId="1"
        departmentId="1"
        levelId="100"
        courseId="1"
      />,
    )

    expect(screen.getByText('Test Carousel')).toBeInTheDocument()
    expect(screen.getByText('4 files')).toBeInTheDocument()
  })

  it('renders each resource title', () => {
    render(
      <ResourceCarousel
        title="Test Carousel"
        fileType="pdf"
        resources={mockResources}
        facultyId="1"
        departmentId="1"
        levelId="100"
        courseId="1"
      />,
    )

    mockResources.forEach(resource => {
      expect(screen.getByText(resource.title)).toBeInTheDocument()
    })
  })

  it('renders correct file type labels', () => {
    render(
      <ResourceCarousel
        title="Test Carousel"
        fileType="pdf"
        resources={mockResources}
        facultyId="1"
        departmentId="1"
        levelId="100"
        courseId="1"
      />,
    )

    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('Document')).toBeInTheDocument()
    expect(screen.getByText('Presentation')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  it('does not render carousel if resources array is empty', () => {
    render(
      <ResourceCarousel
        title="Empty Carousel"
        fileType="pdf"
        resources={[]}
        facultyId="1"
        departmentId="1"
        levelId="100"
        courseId="1"
      />,
    )

    expect(screen.queryByText('Empty Carousel')).not.toBeInTheDocument()
  })

  it('renders scroll buttons when more than 3 resources', () => {
    render(
      <ResourceCarousel
        title="Scroll Test"
        fileType="pdf"
        resources={mockResources}
        facultyId="1"
        departmentId="1"
        levelId="100"
        courseId="1"
      />,
    )

    expect(screen.getByRole('button', { name: /left/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /right/i })).toBeInTheDocument()
  })

  it('calls scroll function when scroll buttons are clicked', () => {
    const { container } = render(
      <ResourceCarousel
        title="Scroll Test"
        fileType="pdf"
        resources={mockResources}
        facultyId="1"
        departmentId="1"
        levelId="100"
        courseId="1"
      />,
    )

    const scrollContainer = container.querySelector(
      'div[style*="scroll-behavior"]',
    ) as HTMLDivElement
    scrollContainer.scrollBy = vi.fn()

    const leftButton = screen.getByRole('button', { name: /scroll left/i })
    const rightButton = screen.getByRole('button', { name: /scroll right/i })

    fireEvent.click(leftButton)
    fireEvent.click(rightButton)

    expect(scrollContainer.scrollBy).toHaveBeenCalledTimes(2)
  })
})
