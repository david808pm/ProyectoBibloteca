/**
 * Shell — Mobile-responsive app layout.
 *
 * USAGE (in App.jsx or your router):
 *   <Shell sidebar={<MySidebarContent />}>
 *     <Page>...</Page>
 *   </Shell>
 *
 * The sidebar is hidden on mobile and toggled by the built-in hamburger button.
 * Customize sidebar width, colors, and nav items — but keep this structure.
 */
import React from 'react'
import {
  AppShell,
  AppShellSidebar,
  AppShellMain,
  MobileSidebarTrigger,
} from '@blinkdotnew/ui'

export function Shell({ sidebar, appName = 'App', children }) {
  return (
    <AppShell>
      <AppShellSidebar>
        {sidebar}
      </AppShellSidebar>

      <AppShellMain>
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-background sticky top-0 z-30">
          <MobileSidebarTrigger />
          <span className="font-semibold text-sm">{appName}</span>
        </div>

        {children}
      </AppShellMain>
    </AppShell>
  )
}