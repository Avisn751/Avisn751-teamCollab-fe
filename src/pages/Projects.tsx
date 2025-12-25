import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loading } from '@/components/ui/loading'
import {
  Plus,
  FolderKanban,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowRight,
  Calendar,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Projects() {
  const { user } = useAuthStore()
  const {
    projects,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    isLoading,
  } = useProjectStore()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<{
    id: string
    name: string
    description?: string
  } | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  const canManageProjects =
    user?.role === 'ADMIN' || user?.role === 'MANAGER'
  const canDeleteProjects = user?.role === 'ADMIN'

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProject(formData)
      setIsCreateOpen(false)
      setFormData({ name: '', description: '' })
    } catch {
      // Error handled in store
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return
    try {
      await updateProject(selectedProject.id, formData)
      setIsEditOpen(false)
      setSelectedProject(null)
      setFormData({ name: '', description: '' })
    } catch {
      // Error handled in store
    }
  }

  const handleDelete = async () => {
    if (!selectedProject) return
    try {
      await deleteProject(selectedProject.id)
      setIsDeleteOpen(false)
      setSelectedProject(null)
    } catch {
      // Error handled in store
    }
  }

  const openEditDialog = (project: {
    id: string
    name: string
    description?: string
  }) => {
    setSelectedProject(project)
    setFormData({ name: project.name, description: project.description || '' })
    setIsEditOpen(true)
  }

  const openDeleteDialog = (project: { id: string; name: string }) => {
    setSelectedProject(project)
    setIsDeleteOpen(true)
  }

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading size="lg" text="Loading projects..." />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
            <FolderKanban className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your team's projects and tasks
            </p>
          </div>
        </div>
        {canManageProjects && (
          <Button onClick={() => setIsCreateOpen(true)} size="lg" className="shrink-0">
            <Plus className="mr-2 h-5 w-5" />
            New Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <Card className="border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <FolderKanban className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Get started by creating your first project to organize your team's work
            </p>
            {canManageProjects && (
              <Button onClick={() => setIsCreateOpen(true)} size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project._id || project.id}
              className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/30 hover:scale-[1.02]"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || 'No description provided'}
                  </CardDescription>
                </div>
                {canManageProjects && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          openEditDialog({
                            id: project._id || project.id,
                            name: project.name,
                            description: project.description,
                          })
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {canDeleteProjects && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            openDeleteDialog({
                              id: project._id || project.id,
                              name: project.name,
                            })
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Link to={`/projects/${project._id || project.id}`}>
                    <Button variant="ghost" size="sm" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      View <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent onClose={() => setIsCreateOpen(false)}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to organize your team's work
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Project Name</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter project description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent onClose={() => setIsEditOpen(false)}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-semibold">Project Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent onClose={() => setIsDeleteOpen(false)}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Delete Project</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{selectedProject?.name}"</span>? This
              action cannot be undone and will delete all associated tasks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}