'use client'

import { VERSION, getLastUpdatedDate } from '@/lib/version'

export function VersionBadge({
  className = '',
}: {
  className?: string
}) {
  return (
    <span
      className={`text-xs font-bold px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ${className}`}
    >
      v{VERSION}
    </span>
  )
}

export function LatestVersionEntry({
  date,
  children,
}: {
  date: string
  children: React.ReactNode
}) {
  return (
    <div className="border-l-4 border-emerald-500 dark:border-emerald-400 pl-4 py-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
          v{VERSION}
        </span>
        <span className="text-xs px-2 py-1 rounded bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300 font-bold">
          LATEST
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{date}</span>
      </div>
      <div className="text-sm space-y-1">{children}</div>
    </div>
  )
}

export function VersionText() {
  return <span>v{VERSION}</span>
}

export function LastUpdatedInfo() {
  return (
    <span className="block text-sm text-gray-500 dark:text-gray-400">
      Last updated: {getLastUpdatedDate()} | Version {VERSION}
    </span>
  )
}

export function ActivelyMaintainedFooter() {
  return (
    <div className="my-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 text-center">
      <span className="block text-lg text-gray-700 dark:text-gray-300 mb-4">
        SonicJS is actively maintained with <strong>3,683+ commits</strong> and{' '}
        <strong>7 years of development</strong>.
      </span>
      <LastUpdatedInfo />
    </div>
  )
}

export { VERSION }
