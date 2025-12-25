import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore'
import { useTeamStore } from '@/stores/teamStore'
import { useAuthStore } from '@/stores/authStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FolderKanban,
  CheckSquare,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { Loading } from '@/components/ui/loading'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { projects, fetchProjects, isLoading: projectsLoading } = useProjectStore()
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTaskStore()
  const { members, fetchMembers, isLoading: membersLoading } = useTeamStore()

  useEffect(() => {
    fetchProjects()
    fetchTasks()
    fetchMembers()
  }, [fetchProjects, fetchTasks, fetchMembers])

  const isLoading = projectsLoading || tasksLoading || membersLoading

  const todoTasks = tasks.filter((t) => t.status === 'todo')
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress')
  const doneTasks = tasks.filter((t) => t.status === 'done')

  const myTasks = tasks.filter((t) => {
    const assignedId = t.assignedTo?._id || t.assignedTo?.id
    const userId = user?._id || user?.id
    return assignedId === userId
  })

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your team's progress and activities
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Active projects in your team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {todoTasks.length} todo
              </Badge>
              <Badge variant="warning" className="text-xs">
                {inProgressTasks.length} in progress
              </Badge>
              <Badge variant="success" className="text-xs">
                {doneTasks.length} done
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              People in your team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks assigned to you
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your team's latest projects</CardDescription>
            </div>
            <Link to="/projects">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No projects yet. Create your first project!
              </p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 4).map((project) => (
                  <div
                    key={project._id || project.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {project.description || 'No description'}
                      </p>
                    </div>
                    <Link to={`/projects/${project._id || project.id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest task updates</CardDescription>
            </div>
            <Link to="/tasks">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks yet. Create your first task!
              </p>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task._id || task.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        task.status === 'done'
                          ? 'bg-green-500'
                          : task.status === 'in-progress'
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(task.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge
                      variant={
                        task.status === 'done'
                          ? 'success'
                          : task.status === 'in-progress'
                          ? 'warning'
                          : 'secondary'
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
