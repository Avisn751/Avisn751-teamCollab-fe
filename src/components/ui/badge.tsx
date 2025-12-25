import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md',
        destructive:
          'border-transparent bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground shadow-md shadow-destructive/20 hover:shadow-lg hover:shadow-destructive/30',
        outline: 'text-foreground border-2 border-primary/20 hover:bg-accent hover:border-primary/40',
        success:
          'border-transparent bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30',
        warning:
          'border-transparent bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md shadow-yellow-500/20 hover:shadow-lg hover:shadow-yellow-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }