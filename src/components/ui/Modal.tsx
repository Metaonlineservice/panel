import { type ReactNode, useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  const w = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${w} rounded-2xl bg-white dark:bg-navy-900 shadow-2xl border border-navy-100 dark:border-navy-800 animate-[modalIn_0.2s_ease-out]`}>
        <div className="flex items-center justify-between p-5 border-b border-navy-100 dark:border-navy-800">
          <h3 className="font-display font-bold text-lg text-navy-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-700 dark:hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex justify-end gap-2 p-5 border-t border-navy-100 dark:border-navy-800">{footer}</div>}
      </div>
    </div>
  )
}
