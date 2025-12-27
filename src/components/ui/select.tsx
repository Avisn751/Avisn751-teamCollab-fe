import * as React from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  placeholder?: string
  disabled?: boolean
}

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  options: SelectOption[]
  registerOption: (option: SelectOption) => void
}

const SelectContext = React.createContext<SelectContextType | null>(null)

const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
}) => {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<SelectOption[]>([])

  const registerOption = React.useCallback((option: SelectOption) => {
    setOptions((prev) => {
      const exists = prev.some((o) => o.value === option.value)
      if (exists) {
        return prev.map((o) => (o.value === option.value ? option : o))
      }
      return [...prev, option]
    })
  }, [])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, options, registerOption }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectTrigger must be used within Select')

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-10 sm:h-11 w-full items-center justify-between whitespace-nowrap rounded-xl border-2 border-input bg-background px-3 sm:px-4 py-2 text-sm shadow-sm ring-offset-background transition-all duration-200 placeholder:text-muted-foreground hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        className
      )}
      onClick={() => context.setOpen(!context.open)}
      {...props}
    >
      {children}
      <ChevronDown className={cn(
        'h-4 w-4 opacity-50 transition-transform duration-200',
        context.open && 'rotate-180'
      )} />
    </button>
  )
})
SelectTrigger.displayName = 'SelectTrigger'

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectValue must be used within Select')

  const selectedOption = context.options.find((o) => o.value === context.value)
  
  // Don't show raw ObjectId - show placeholder if no label found
  const isValidLabel = selectedOption?.label && !selectedOption.label.match(/^[a-f0-9]{24}$/i)
  const displayText = isValidLabel ? selectedOption.label : null

  return (
    <span className={cn((!context.value || !displayText) && 'text-muted-foreground')}>
      {displayText || placeholder || 'Select...'}
    </span>
  )
}

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectContent must be used within Select')

  if (!context.open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => context.setOpen(false)}
      />
      <div
        ref={ref}
        className={cn(
          'absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border-2 bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 duration-200',
          className
        )}
        {...props}
      >
        <div className="p-1">{children}</div>
      </div>
    </>
  )
})
SelectContent.displayName = 'SelectContent'

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectItem must be used within Select')

  // Extract text content from children
const getTextContent = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getTextContent).join('')
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    if (props.children) {
      return getTextContent(props.children)
    }
  }
  return ''
}

  const label = getTextContent(children)

  React.useEffect(() => {
    context.registerOption({ value, label: label || value })
  }, [value, label, context.registerOption])

  const isSelected = context.value === value

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 px-3 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
        isSelected && 'bg-accent font-semibold',
        className
      )}
      onClick={() => {
        context.onValueChange(value)
        context.setOpen(false)
      }}
      {...props}
    >
      <span className="flex-1">{children}</span>
      {isSelected && <Check className="h-4 w-4 ml-2 text-primary" />}
    </div>
  )
})
SelectItem.displayName = 'SelectItem'

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }