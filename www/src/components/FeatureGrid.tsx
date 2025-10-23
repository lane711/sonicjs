import Link from 'next/link'
import clsx from 'clsx'

interface Feature {
  icon: string
  title: string
  description: string
  link?: string
}

interface FeatureGridProps {
  features: Feature[]
  columns?: 2 | 3 | 4
}

export function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={clsx('not-prose my-8 grid gap-4', gridCols[columns])}>
      {features.map((feature, index) => {
        const content = (
          <>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl" role="img" aria-label={feature.title}>
                {feature.icon}
              </span>
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                {feature.title}
              </h3>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {feature.description}
            </p>
          </>
        )

        const baseClasses = 'rounded-lg border border-zinc-900/10 dark:border-white/10 p-4'

        if (feature.link) {
          return (
            <Link
              key={index}
              href={feature.link}
              className={clsx(
                baseClasses,
                'transition-colors hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
              )}
            >
              {content}
            </Link>
          )
        }

        return (
          <div key={index} className={baseClasses}>
            {content}
          </div>
        )
      })}
    </div>
  )
}
