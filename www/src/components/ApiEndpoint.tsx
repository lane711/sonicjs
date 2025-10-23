import clsx from 'clsx'
import { Tag } from '@/components/Tag'

const methodColors = {
  GET: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
  POST: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900',
  PUT: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
  DELETE: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900',
  PATCH: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-900',
}

interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description?: string
  auth?: boolean
}

export function ApiEndpoint({ method, path, description, auth = true }: ApiEndpointProps) {
  return (
    <div className="my-6 rounded-lg border border-zinc-900/10 dark:border-white/10 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-900/10 dark:border-white/10">
        <span className={clsx(
          'px-2.5 py-1 text-xs font-bold rounded border',
          methodColors[method]
        )}>
          {method}
        </span>
        <code className="text-sm font-mono text-zinc-900 dark:text-zinc-100 flex-1">
          {path}
        </code>
        {auth && (
          <Tag variant="small" color="zinc">
            Auth required
          </Tag>
        )}
      </div>
      {description && (
        <div className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
          {description}
        </div>
      )}
    </div>
  )
}
