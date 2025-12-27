import { useEffect, useState } from 'react'
import { useTeamStore } from '@/stores/teamStore'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Loading } from '@/components/ui/loading'
import {
  Users,
  Plus,
  MoreVertical,
  UserCog,
  UserMinus,
  Mail,
  Shield,
  Crown,
  UserCheck,
  Sparkles,
  Trash2,
  Loader2,
} from 'lucide-react'

export default function Team() {
  const { user } = useAuthStore()
  const {
    team,
    members,
    fetchTeam,
    fetchMembers,
    addMember,
    updateMember,
    removeMember,
    isLoading,
  } = useTeamStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<{
    id: string
    name: string
    role: UserRole
  } | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'MEMBER' as UserRole,
  })

  const isAdmin = user?.role === 'ADMIN'
  const isManager = user?.role === 'MANAGER'
  const canManageMembers = isAdmin || isManager

  const resetFormData = () => {
    setFormData({ email: '', name: '', role: 'MEMBER' })
  }

  const handleOpenAddDialog = () => {
    resetFormData()
    setIsAddOpen(true)
  }

  const handleCloseAddDialog = () => {
    resetFormData()
    setIsAddOpen(false)
  }

  const handleCloseEditDialog = () => {
    setSelectedMember(null)
    setIsEditOpen(false)
  }

  const handleCloseRemoveDialog = () => {
    setSelectedMember(null)
    setIsRemoveOpen(false)
  }

  useEffect(() => {
    fetchTeam()
    fetchMembers()
  }, [fetchTeam, fetchMembers])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email.trim()) return
    try {
      await addMember(formData)
      handleCloseAddDialog()
    } catch {
      // Error handled in store
    }
  }

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return
    try {
      await updateMember(selectedMember.id, formData.role)
      handleCloseEditDialog()
    } catch {
      // Error handled in store
    }
  }

  const handleRemove = async () => {
    if (!selectedMember) return
    try {
      await removeMember(selectedMember.id)
      handleCloseRemoveDialog()
    } catch {
      // Error handled in store
    }
  }

  const openEditDialog = (member: {
    id: string
    name: string
    role: UserRole
  }) => {
    setSelectedMember(member)
    setFormData({ ...formData, role: member.role })
    setIsEditOpen(true)
  }

  const openRemoveDialog = (member: { id: string; name: string }) => {
    setSelectedMember({ ...member, role: 'MEMBER' })
    setIsRemoveOpen(true)
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'MANAGER':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="h-3 w-3" />
      case 'MANAGER':
        return <UserCog className="h-3 w-3" />
      default:
        return <UserCheck className="h-3 w-3" />
    }
  }

  const currentUserId = user?._id || user?.id

  if (isLoading && members.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading size="lg" text="Loading team..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-0 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Team</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your team members and their roles
            </p>
          </div>
        </div>
        {canManageMembers && (
          <Button onClick={handleOpenAddDialog} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Member
          </Button>
        )}
      </div>
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-card to-card/50">
          <CardTitle className="text-lg sm:text-xl">
            Team Members ({members.length})
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            People who have access to this team's projects and tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {members.map((member) => {
              const memberId = member._id || member.id
              const isCurrentUser = memberId === currentUserId
              const teamAdminId =
                typeof team?.adminId === 'string'
                  ? team.adminId
                  : team?.adminId?._id || team?.adminId?.id
              const isTeamAdmin = memberId === teamAdminId

              return (
                <div
                  key={memberId}
                  className={`flex items-center justify-between rounded-xl border-2 p-3 sm:p-4 transition-all duration-200 ${
                    isCurrentUser
                      ? 'border-primary/30 bg-primary/5'
                      : 'hover:border-primary/20 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <Avatar className={`h-10 w-10 sm:h-12 sm:w-12 ring-2 ${
                      isTeamAdmin 
                        ? 'ring-yellow-500/30' 
                        : isCurrentUser 
                        ? 'ring-primary/30' 
                        : 'ring-green-500/20'
                    }`}>
                      <AvatarFallback className={`text-sm font-semibold ${
                        isTeamAdmin
                          ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white'
                          : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                      }`}>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm sm:text-base truncate">
                          {member.name}
                        </p>
                        {isTeamAdmin && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded-full">
                            <Shield className="h-3 w-3" />
                            <span className="text-xs font-semibold">Admin</span>
                          </div>
                        )}
                        {isCurrentUser && (
                          <span className="text-xs text-primary font-semibold px-2 py-0.5 bg-primary/10 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 ml-2">
                    <Badge 
                      variant={getRoleBadgeVariant(member.role)} 
                      className="font-semibold gap-1 hidden sm:flex"
                    >
                      {getRoleIcon(member.role)}
                      {member.role}
                    </Badge>
                    <Badge 
                      variant={getRoleBadgeVariant(member.role)} 
                      className="font-semibold sm:hidden"
                    >
                      {getRoleIcon(member.role)}
                    </Badge>
                    {isAdmin && !isCurrentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              openEditDialog({
                                id: memberId,
                                name: member.name,
                                role: member.role,
                              })
                            }
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          {!isTeamAdmin && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                openRemoveDialog({
                                  id: memberId,
                                  name: member.name,
                                })
                              }
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => !open && handleCloseAddDialog()}>
        <DialogContent onClose={handleCloseAddDialog}>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Add Team Member
            </DialogTitle>
            <DialogDescription>
              Invite a new member to join your team
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd}>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Name (optional)</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as UserRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">👤 Member</SelectItem>
                    <SelectItem value="MANAGER">⚙️ Manager</SelectItem>
                    {isAdmin && <SelectItem value="ADMIN">👑 Admin</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCloseAddDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !formData.email.trim()}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Adding...' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent onClose={handleCloseEditDialog}>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <UserCog className="h-6 w-6 text-primary" />
              Change Role
            </DialogTitle>
            <DialogDescription>
              Update the role for <span className="font-semibold text-foreground">{selectedMember?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRole}>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as UserRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">👤 Member</SelectItem>
                    <SelectItem value="MANAGER">⚙️ Manager</SelectItem>
                    <SelectItem value="ADMIN">👑 Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCloseEditDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
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

      {/* Remove Member Dialog */}
      <Dialog open={isRemoveOpen} onOpenChange={(open) => !open && handleCloseRemoveDialog()}>
        <DialogContent onClose={handleCloseRemoveDialog}>
          <DialogHeader>
            <DialogTitle className="text-2xl text-destructive flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Remove Team Member
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to remove <span className="font-semibold text-foreground">{selectedMember?.name}</span> from the
              team? They will lose access to all team projects and tasks.
              <br />
              <span className="text-destructive font-medium">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseRemoveDialog}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserMinus className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Removing...' : 'Remove Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}