import { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useTeamStore } from '@/stores/teamStore'
import { useAuthStore } from '@/stores/authStore'
import { useSocket } from '@/hooks/useSocket'
import type { Task, TaskStatus, TaskPriority } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loading } from '@/components/ui/loading'
import { Plus, MoreVertical, Pencil, Trash2, User, GripVertical, CheckSquare, Sparkles, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const columns: { id: TaskStatus; title: string; color: string; bgColor: string; icon: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-500', bgColor: 'bg-gray-500/10', icon: '📋' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500', bgColor: 'bg-yellow-500/10', icon: '⚡' },
  { id: 'done', title: 'Done', color: 'bg-green-500', bgColor: 'bg-green-500/10', icon: '✅' },
]

const getTaskId = (task: Task): string => String(task._id || task.id)

export default function Tasks() {
  const { projectId } = useParams()
  const [searchParams] = useSearchParams()
  const filterProjectId = projectId || searchParams.get('projectId') || undefined
  
  const { user } = useAuthStore()
  const {
    tasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskInStore,
    addTask,
    removeTask,
    isLoading,
  } = useTaskStore()
  const { projects, fetchProjects } = useProjectStore()
  const { members, fetchMembers } = useTeamStore()
  const { on, off } = useSocket()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filterByUser, setFilterByUser] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    projectId: '',
    assignedTo: '',
  })

  useEffect(() => {
    fetchTasks(filterProjectId)
    fetchProjects()
    fetchMembers()
  }, [fetchTasks, fetchProjects, fetchMembers, filterProjectId])

  useEffect(() => {
    const handleTaskCreated = (task: Task) => {
      addTask(task)
    }
    const handleTaskUpdated = (task: Task) => {
      updateTaskInStore(task)
    }
    const handleTaskDeleted = ({ taskId }: { taskId: string }) => {
      removeTask(taskId)
    }

    const unsub1 = on('task:created', handleTaskCreated)
    const unsub2 = on('task:updated', handleTaskUpdated)
    const unsub3 = on('task:deleted', handleTaskDeleted)

    return () => {
      unsub1?.()
      unsub2?.()
      unsub3?.()
    }
  }, [on, off, addTask, updateTaskInStore, removeTask])

  const resetFormData = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      projectId: '',
      assignedTo: '',
    })
  }

  const handleOpenCreateDialog = () => {
    resetFormData()
    setIsCreateOpen(true)
  }

  const handleCloseCreateDialog = () => {
    resetFormData()
    setIsCreateOpen(false)
  }

  const handleCloseEditDialog = () => {
    resetFormData()
    setSelectedTask(null)
    setIsEditOpen(false)
  }

  const filteredTasks = useMemo(() => {
    let result = filterProjectId
      ? tasks.filter((t) => {
          const taskProjectId =
            typeof t.projectId === 'string' ? t.projectId : t.projectId?._id || t.projectId?.id
          return taskProjectId === filterProjectId
        })
      : tasks
    
    if (filterByUser) {
      result = result.filter((t) => {
        const assignedId = t.assignedTo?._id || t.assignedTo?.id
        return assignedId === filterByUser
      })
    }
    
    return result
  }, [tasks, filterProjectId, filterByUser])

  const getTasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status)

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, source, destination } = result
    const newStatus = destination.droppableId as TaskStatus
    const oldStatus = source.droppableId as TaskStatus

    if (oldStatus === newStatus && source.index === destination.index) return

    const task = tasks.find((t) => getTaskId(t) === draggableId)
    if (!task) return

    updateTaskInStore({ ...task, status: newStatus })

    try {
      await updateTask(draggableId, { status: newStatus })
    } catch {
      updateTaskInStore({ ...task, status: oldStatus })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    const projectIdToUse = formData.projectId || filterProjectId || projects[0]?._id || projects[0]?.id
    if (!projectIdToUse) return

    try {
      await createTask({
        ...formData,
        projectId: projectIdToUse,
        assignedTo: formData.assignedTo || undefined,
      })
      handleCloseCreateDialog()
    } catch {
      // Error handled in store
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask || !formData.title.trim()) return

    try {
      await updateTask(selectedTask._id || selectedTask.id, {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignedTo: formData.assignedTo || null,
      })
      handleCloseEditDialog()
    } catch {
      // Error handled in store
    }
  }

  const handleDelete = async () => {
    if (!selectedTask) return
    try {
      await deleteTask(selectedTask._id || selectedTask.id)
      setIsDeleteOpen(false)
      setSelectedTask(null)
    } catch {
      // Error handled in store
    }
  }

  const openEditDialog = (task: Task) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      projectId: typeof task.projectId === 'string' ? task.projectId : task.projectId?._id || task.projectId?.id || '',
      assignedTo: task.assignedTo?._id || task.assignedTo?.id || '',
    })
    setIsEditOpen(true)
  }

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task)
    setIsDeleteOpen(true)
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'warning'
      case 'low':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading size="lg" text="Loading tasks..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
            <CheckSquare className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Tasks</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Drag and drop tasks to update their status
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterByUser} onValueChange={setFilterByUser}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Users</SelectItem>
              {members.map((member) => (
                <SelectItem key={member._id || member.id} value={member._id || member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleOpenCreateDialog} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            New Task
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl ${column.bgColor} border-2 border-transparent hover:border-primary/20 transition-colors`}>
                <span className="text-2xl">{column.icon}</span>
                <h3 className="font-bold text-base sm:text-lg">{column.title}</h3>
                <Badge variant="secondary" className="ml-auto font-semibold">
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>

              <Droppable droppableId={column.id} type="TASK">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[300px] sm:min-h-[400px] rounded-xl border-2 border-dashed p-3 transition-all duration-200 ${
                      snapshot.isDraggingOver
                        ? 'border-primary bg-primary/5 scale-[1.01]'
                        : 'border-muted-foreground/20 bg-muted/20'
                    }`}
                  >
                    {getTasksByStatus(column.id).length === 0 ? (
                      <div className="flex items-center justify-center h-40 text-muted-foreground">
                        <p className="text-sm">Drop tasks here</p>
                      </div>
                    ) : (
                      getTasksByStatus(column.id).map((task, index) => (
                        <Draggable
                          key={getTaskId(task)}
                          draggableId={getTaskId(task)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`cursor-grab active:cursor-grabbing border-2 transition-all duration-200 ${
                                snapshot.isDragging 
                                  ? 'shadow-2xl rotate-3 scale-105 border-primary' 
                                  : 'hover:shadow-xl hover:border-primary/30'
                              }`}
                            >
                              <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                                <div className="flex items-start gap-2 sm:gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-0.5 sm:mt-1 cursor-grab active:cursor-grabbing hover:text-primary transition-colors"
                                  >
                                    <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                  </div>
                                  <CardTitle className="text-sm sm:text-base font-semibold line-clamp-2 flex-1 leading-tight">
                                    {task.title}
                                  </CardTitle>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 hover:bg-accent"
                                      >
                                        <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openEditDialog(task)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => openDeleteDialog(task)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </CardHeader>
                              <CardContent className="p-3 sm:p-4 pt-0">
                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between gap-2">
                                  <Badge variant={getPriorityColor(task.priority)} className="font-semibold text-xs">
                                    {task.priority}
                                  </Badge>
                                  {task.assignedTo ? (
                                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 ring-2 ring-background shadow-sm">
                                      <AvatarFallback className="text-[9px] sm:text-[10px] font-semibold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                                        {getInitials(task.assignedTo.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : (
                                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-muted flex items-center justify-center">
                                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Create Task Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => !open && handleCloseCreateDialog()}>
        <DialogContent onClose={handleCloseCreateDialog} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Create New Task
            </DialogTitle>
            <DialogDescription>
              Add a new task to your project and assign it to a team member
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Design landing page mockup"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add task details, requirements, or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              
              {!filterProjectId && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Project *</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem
                          key={project._id || project.id}
                          value={project._id || project.id}
                        >
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low Priority</SelectItem>
                      <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                      <SelectItem value="high">🔴 High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Assign To</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {members.map((member) => (
                        <SelectItem
                          key={member._id || member.id}
                          value={member._id || member.id}
                        >
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreateDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !formData.title.trim()}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent onClose={handleCloseEditDialog} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Pencil className="h-6 w-6 text-primary" />
              Edit Task
            </DialogTitle>
            <DialogDescription>Update task details and assignment</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-sm font-semibold">Task Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">📋 To Do</SelectItem>
                      <SelectItem value="in-progress">⚡ In Progress</SelectItem>
                      <SelectItem value="done">✅ Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low Priority</SelectItem>
                      <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                      <SelectItem value="high">🔴 High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Assign To</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {members.map((member) => (
                      <SelectItem
                        key={member._id || member.id}
                        value={member._id || member.id}
                      >
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEditDialog}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !formData.title.trim()}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent onClose={() => setIsDeleteOpen(false)}>
          <DialogHeader>
            <DialogTitle className="text-2xl text-destructive flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Delete Task
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{selectedTask?.title}"</span>?
              <br />
              <span className="text-destructive font-medium">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Deleting...' : 'Delete Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}