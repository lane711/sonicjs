import { ReactNode } from 'react'

interface TLDRBoxProps {
  children: ReactNode
}

export function TLDRBox({ children }: TLDRBoxProps) {
  return (
    <div className="not-prose my-8 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 dark:border-emerald-800 dark:from-emerald-950/50 dark:to-teal-950/50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-lg bg-emerald-500 p-2 text-white dark:bg-emerald-600">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="prose prose-sm prose-zinc dark:prose-invert prose-strong:text-emerald-700 dark:prose-strong:text-emerald-400 prose-ul:my-2 prose-li:my-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
