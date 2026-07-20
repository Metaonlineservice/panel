import { type ReactNode } from 'react'

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-card ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 border-b border-navy-100 dark:border-navy-800">
      <div>
        <h3 className="font-display font-bold text-navy-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-navy-500 dark:text-navy-300 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardBody({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`p-5 ${className}`}>{children}</div>
}
