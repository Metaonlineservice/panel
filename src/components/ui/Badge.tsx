const COLORS: Record<string, string> = {
  navy: 'bg-navy-100 text-navy-800 dark:bg-navy-700 dark:text-navy-100',
  gold: 'bg-gold-100 text-gold-800 dark:bg-gold-900/40 dark:text-gold-200',
  green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  red: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  gray: 'bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-300',
}

export function Badge({ children, color = 'gray', className = '' }: { children: React.ReactNode; color?: keyof typeof COLORS | string; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${COLORS[color] || COLORS.gray} ${className}`}>
      {children}
    </span>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-navy-200 border-t-gold-400 ${className}`} style={{ width: '1.25em', height: '1.25em' }} />
  )
}
