/**
 * Plugin Manifest Types
 *
 * Defines the structure for plugin manifest.json files
 */

export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author: string
  homepage?: string
  repository?: string
  license?: string
  category: string
  tags?: string[]
  dependencies?: string[]
  settings?: Record<string, any>
  hooks?: Record<string, string>
  routes?: Array<{
    path: string
    method: string
    handler: string
    description?: string
  }>
  permissions?: Record<string, string>
  adminMenu?: {
    label: string
    icon: string
    path: string
    order: number
  }
}
