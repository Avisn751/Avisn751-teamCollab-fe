import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function Loading({ className, size = 'md', text }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 sm:gap-4', className)}>
      <div className="relative">
        <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
        <div className={cn(
          'absolute inset-0 animate-ping rounded-full bg-primary/20',
          sizeClasses[size]
        )} />
      </div>
      {text && (
        <p className="text-sm sm:text-base font-medium text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <div className="h-20 w-20 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-transparent border-t-primary" />
          <div className="absolute inset-2 h-16 w-16 animate-ping rounded-full bg-primary/10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Loading
          </h2>
          <p className="text-sm text-muted-foreground">Please wait while we prepare your content...</p>
        </div>
      </div>
    </div>
  )
}