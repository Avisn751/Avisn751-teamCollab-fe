import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Bot,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/chat', icon: MessageSquare, label: 'Team Chat' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/assistant', icon: Bot, label: 'Assistant' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex h-screen w-64 sm:w-72 flex-col border-r bg-card shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex h-16 sm:h-20 items-center justify-between border-b px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/25">
            <FolderKanban className="h-5 w-5" />
          </div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            TeamCollab
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-auto p-3 sm:p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.01]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  'h-5 w-5 transition-transform',
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                )} />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
        
        <Separator className="my-4" />
        
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/25'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.01]'
            )
          }
        >
          <Settings className="h-5 w-5 transition-transform group-hover:scale-110 group-hover:rotate-90" />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* User Profile */}
      <div className="border-t bg-muted/5 p-3 sm:p-4">
        <div className="flex items-center gap-3 rounded-xl bg-background/50 px-3 sm:px-4 py-3 shadow-sm">
          <Avatar className="h-10 w-10 sm:h-11 sm:w-11 ring-2 ring-primary/10">
            <AvatarFallback className="text-xs sm:text-sm bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="mt-3 w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}