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
  Sparkles,
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
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
            Dashboard
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Overview of your team's progress and activities
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Total Projects</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 bg-clip-text text-transparent">
              {projects.length}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Active projects in your team
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Total Tasks</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-purple-500 to-purple-600 bg-clip-text text-transparent">
              {tasks.length}
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {todoTasks.length} todo
              </Badge>
              <Badge variant="warning" className="text-xs">
                {inProgressTasks.length} active
              </Badge>
              <Badge variant="success" className="text-xs">
                {doneTasks.length} done
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">Team Members</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-green-500 to-green-600 bg-clip-text text-transparent">
              {members.length}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              People in your team
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">My Tasks</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {myTasks.length}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Tasks assigned to you
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Recent Projects</CardTitle>
              <CardDescription>Your team's latest projects</CardDescription>
            </div>
            <Link to="/projects">
              <Button variant="ghost" size="sm" className="gap-2">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 px-4">
                <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No projects yet. Create your first project!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 4).map((project) => (
                  <div
                    key={project._id || project.id}
                    className="group flex items-center justify-between rounded-xl border-2 p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {project.description || 'No description'}
                      </p>
                    </div>
                    <Link to={`/projects/${project._id || project.id}`}>
                      <Button variant="ghost" size="sm" className="ml-2">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
              <CardDescription>Latest task updates</CardDescription>
            </div>
            <Link to="/tasks">
              <Button variant="ghost" size="sm" className="gap-2">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8 px-4">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No tasks yet. Create your first task!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task._id || task.id}
                    className="flex items-center gap-3 rounded-xl border-2 p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                  >
                    <div
                      className={`h-3 w-3 rounded-full shrink-0 shadow-lg ${
                        task.status === 'done'
                          ? 'bg-green-500 shadow-green-500/50'
                          : task.status === 'in-progress'
                          ? 'bg-yellow-500 shadow-yellow-500/50'
                          : 'bg-gray-400 shadow-gray-400/50'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{task.title}</p>
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
                      className="shrink-0"
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