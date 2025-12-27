import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useState } from 'react'
import { useSocket } from '@/hooks/useSocket'
import useToastStore from '@/stores/toastStore'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // initialize socket for the authenticated user and global listeners
  useSocket()
  const { message, type } = useToastStore()

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        {message && (
          <div className="fixed right-6 bottom-6 z-50">
            <div className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${type === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>
              {type === 'error' ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" /></svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              )}
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}