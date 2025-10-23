'use client'

import { useState, type ReactNode } from 'react'
import clsx from 'clsx'

interface Tab {
  label: string
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultIndex?: number
}

export function Tabs({ tabs, defaultIndex = 0 }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex)

  return (
    <div className="my-6 rounded-lg border border-zinc-900/10 dark:border-white/10">
      <div className="border-b border-zinc-900/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={clsx(
                'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative',
                activeIndex === index
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              {tab.label}
              {activeIndex === index && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        {tabs[activeIndex].content}
      </div>
    </div>
  )
}
