import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore } from '@/stores/projectStore'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ArrowLeft, ListTodo } from 'lucide-react'
import Tasks from './Tasks'

export default function ProjectDetail() {
  const { projectId } = useParams()
  const { currentProject, fetchProject, isLoading } = useProjectStore()

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId)
    }
  }, [projectId, fetchProject])

  if (isLoading && !currentProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading size="lg" text="Loading project..." />
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Project not found</p>
        <Link to="/projects">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ListTodo className="h-8 w-8" />
            {currentProject.name}
          </h2>
          <p className="text-muted-foreground">
            {currentProject.description || 'No description'}
          </p>
        </div>
      </div>

      <Tasks />
    </div>
  )
}
