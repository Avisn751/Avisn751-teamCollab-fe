import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore } from '@/stores/projectStore'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ArrowLeft, ListTodo, Calendar, FolderKanban } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
      <div className="flex h-full flex-col items-center justify-center px-4 animate-in fade-in-0 duration-500">
        <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
          <FolderKanban className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold mb-2">Project not found</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/projects">
          <Button variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <Link to="/projects">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
              <ListTodo className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {currentProject.name}
              </h2>
            </div>
          </div>
          
          {currentProject.description && (
            <Card className="border-2 border-primary/10 bg-gradient-to-r from-card to-card/50">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-sm sm:text-base">
                  {currentProject.description}
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Created {new Date(currentProject.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            {currentProject.updatedAt && currentProject.createdAt !== currentProject.updatedAt && (
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>
                  Updated {new Date(currentProject.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tasks />
    </div>
  )
}