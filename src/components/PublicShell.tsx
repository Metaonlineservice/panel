import { Outlet } from 'react-router-dom'
import { PublicNavbar, PublicFooter } from './PublicLayout'

export function PublicShell() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-navy-950 text-navy-900 dark:text-navy-50">
      <PublicNavbar />
      <main className="flex-1"><Outlet /></main>
      <PublicFooter />
    </div>
  )
}
