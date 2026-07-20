import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-gold-400 hover:bg-gold-500 text-navy-900 font-semibold shadow-sm',
  secondary: 'bg-navy-700 hover:bg-navy-800 text-white font-semibold shadow-sm',
  outline: 'border border-navy-200 dark:border-navy-700 text-navy-800 dark:text-navy-100 hover:bg-navy-50 dark:hover:bg-navy-800',
  ghost: 'text-navy-700 dark:text-navy-200 hover:bg-navy-50 dark:hover:bg-navy-800',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white font-semibold',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gold-300 focus:ring-offset-1 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
