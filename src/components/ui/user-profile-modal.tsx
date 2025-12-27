import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mail, Shield, UserCog, UserCheck, Calendar, X } from 'lucide-react'
import type { User, UserRole } from '@/types'

interface UserProfileModalProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfileModal({ user, open, onOpenChange }: UserProfileModalProps) {
  if (!user) return null

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
        return <Shield className="h-4 w-4" />
      case 'MANAGER':
        return <UserCog className="h-4 w-4" />
      default:
        return <UserCheck className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 ring-4 ring-primary/20">
            {user.profileImage ? (
              <AvatarImage src={user.profileImage} alt={user.name} />
            ) : null}
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold">{user.name}</h3>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{user.email}</span>
            </div>
          </div>
          
          <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1 px-3 py-1">
            {getRoleIcon(user.role)}
            <span>{user.role}</span>
          </Badge>
          
          {user.isInvitedUser && (
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              Invited member
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
