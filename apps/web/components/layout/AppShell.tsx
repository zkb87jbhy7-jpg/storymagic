'use client'

import { useState, useCallback } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { cn } from '@/lib/utils/cn'

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const handleMobileMenuToggle = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev)
  }, [])

  return (
    <div className="flex h-screen flex-col">
      <Header
        onMenuToggle={handleMobileMenuToggle}
        isSidebarOpen={mobileSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex">
          <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={handleMobileMenuToggle}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 start-0 z-40 w-64 lg:hidden">
              <Sidebar
                isOpen={true}
                onToggle={handleMobileMenuToggle}
                className="h-full"
              />
            </div>
          </>
        )}

        {/* Main content area */}
        <main
          className={cn(
            'flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950',
            'p-4 pb-20 sm:p-6 md:pb-6 lg:p-8',
            className
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  )
}
