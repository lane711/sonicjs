import { type ReactNode } from 'react'
import clsx from 'clsx'

const styles = {
  info: {
    container: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
    title: 'text-blue-900 dark:text-blue-200',
    body: 'text-blue-800 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    container: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
    title: 'text-amber-900 dark:text-amber-200',
    body: 'text-amber-800 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    container: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900',
    title: 'text-red-900 dark:text-red-200',
    body: 'text-red-800 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400',
  },
  success: {
    container: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900',
    title: 'text-emerald-900 dark:text-emerald-200',
    body: 'text-emerald-800 dark:text-emerald-300',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  tip: {
    container: 'bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-900',
    title: 'text-violet-900 dark:text-violet-200',
    body: 'text-violet-800 dark:text-violet-300',
    icon: 'text-violet-600 dark:text-violet-400',
  },
}

const icons = {
  info: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  tip: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
}

interface CalloutProps {
  type?: 'info' | 'warning' | 'error' | 'success' | 'tip'
  title?: string
  children: ReactNode
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const style = styles[type]
  const icon = icons[type]

  return (
    <div className={clsx(
      'my-6 rounded-lg border p-4',
      style.container
    )}>
      <div className="flex">
        <div className={clsx('flex-shrink-0', style.icon)}>
          {icon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={clsx('text-sm font-semibold mb-2', style.title)}>
              {title}
            </h3>
          )}
          <div className={clsx('text-sm prose-sm', style.body, '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0')}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
