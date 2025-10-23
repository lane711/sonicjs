'use client'

import { CodeGroup } from '@/components/Code'

interface Example {
  language: string
  code: string
  label?: string
}

interface CodeExampleProps {
  examples: Example[]
}

export function CodeExample({ examples }: CodeExampleProps) {
  if (examples.length === 1) {
    return (
      <CodeGroup title={examples[0].label || ''}>
        <pre>
          <code className={`language-${examples[0].language}`}>
            {examples[0].code}
          </code>
        </pre>
      </CodeGroup>
    )
  }

  return (
    <CodeGroup title="">
      {examples.map((example, index) => (
        <pre key={index} title={example.label || example.language.toUpperCase()}>
          <code className={`language-${example.language}`}>
            {example.code}
          </code>
        </pre>
      ))}
    </CodeGroup>
  )
}
