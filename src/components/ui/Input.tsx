import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...rest }: InputProps) {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1.5">{label}</label>}
      <input
        id={id}
        className={`w-full rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3.5 py-2.5 text-navy-900 dark:text-navy-50 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:border-transparent transition ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', id, ...rest }: TextareaProps) {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1.5">{label}</label>}
      <textarea
        id={id}
        className={`w-full rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3.5 py-2.5 text-navy-900 dark:text-navy-50 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:border-transparent transition ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: ReactNode
}

export function Select({ label, error, className = '', id, children, ...rest }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1.5">{label}</label>}
      <select
        id={id}
        className={`w-full rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3.5 py-2.5 text-navy-900 dark:text-navy-50 focus:outline-none focus:ring-2 focus:ring-gold-300 focus:border-transparent transition ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  )
}
