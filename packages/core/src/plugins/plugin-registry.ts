/**
 * Plugin Registry Implementation
 * 
 * Manages plugin registration, activation, and lifecycle
 */

import { Plugin, PluginRegistry, PluginConfig, PluginStatus } from '../types'
import { PluginValidator } from './plugin-validator'

export class PluginRegistryImpl implements PluginRegistry {
  private plugins: Map<string, Plugin> = new Map()
  private configs: Map<string, PluginConfig> = new Map()
  private statuses: Map<string, PluginStatus> = new Map()
  private validator: PluginValidator

  constructor(validator?: PluginValidator) {
    this.validator = validator || new PluginValidator()
  }

  /**
   * Get plugin by name
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * Get all registered plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get active plugins
   */
  getActive(): Plugin[] {
    return this.getAll().filter(plugin => {
      const status = this.statuses.get(plugin.name)
      return status?.active === true
    })
  }

  /**
   * Register a plugin
   */
  async register(plugin: Plugin): Promise<void> {
    console.info(`Registering plugin: ${plugin.name} v${plugin.version}`)

    // Validate plugin
    const validation = this.validator.validate(plugin)
    if (!validation.valid) {
      throw new Error(`Plugin validation failed for ${plugin.name}: ${validation.errors.join(', ')}`)
    }

    // Check for conflicts
    if (this.plugins.has(plugin.name)) {
      const existingPlugin = this.plugins.get(plugin.name)!
      if (existingPlugin.version !== plugin.version) {
        console.warn(`Plugin ${plugin.name} is already registered with version ${existingPlugin.version}, replacing with ${plugin.version}`)
      }
    }

    // Validate dependencies
    const depValidation = this.validator.validateDependencies(plugin, this)
    if (!depValidation.valid) {
      throw new Error(`Plugin dependency validation failed for ${plugin.name}: ${depValidation.errors.join(', ')}`)
    }

    // Register plugin
    this.plugins.set(plugin.name, plugin)
    
    // Initialize status
    this.statuses.set(plugin.name, {
      name: plugin.name,
      version: plugin.version,
      active: false,
      installed: true,
      hasErrors: false,
      errors: []
    })

    console.info(`Plugin registered successfully: ${plugin.name}`)
  }

  /**
   * Unregister a plugin
   */
  async unregister(name: string): Promise<void> {
    console.info(`Unregistering plugin: ${name}`)

    if (!this.plugins.has(name)) {
      throw new Error(`Plugin not found: ${name}`)
    }

    // Check if other plugins depend on this one
    const dependents = this.getDependents(name)
    if (dependents.length > 0) {
      throw new Error(`Cannot unregister ${name}: plugins ${dependents.join(', ')} depend on it`)
    }

    // Remove plugin
    this.plugins.delete(name)
    this.configs.delete(name)
    this.statuses.delete(name)

    console.info(`Plugin unregistered: ${name}`)
  }

  /**
   * Check if plugin is registered
   */
  has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * Activate a plugin
   */
  async activate(name: string): Promise<void> {
    console.info(`Activating plugin: ${name}`)

    const plugin = this.plugins.get(name)
    if (!plugin) {
      throw new Error(`Plugin not found: ${name}`)
    }

    const status = this.statuses.get(name)
    if (status?.active) {
      console.warn(`Plugin ${name} is already active`)
      return
    }

    try {
      // Activate dependencies first
      if (plugin.dependencies) {
        for (const depName of plugin.dependencies) {
          const depStatus = this.statuses.get(depName)
          if (!depStatus?.active) {
            await this.activate(depName)
          }
        }
      }

      // Update status
      this.updateStatus(name, {
        active: true,
        hasErrors: false,
        errors: []
      })

      console.info(`Plugin activated: ${name}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.updateStatus(name, {
        active: false,
        hasErrors: true,
        errors: [errorMessage],
        lastError: errorMessage
      })
      throw new Error(`Failed to activate plugin ${name}: ${errorMessage}`)
    }
  }

  /**
   * Deactivate a plugin
   */
  async deactivate(name: string): Promise<void> {
    console.info(`Deactivating plugin: ${name}`)

    const plugin = this.plugins.get(name)
    if (!plugin) {
      throw new Error(`Plugin not found: ${name}`)
    }

    const status = this.statuses.get(name)
    if (!status?.active) {
      console.warn(`Plugin ${name} is not active`)
      return
    }

    try {
      // Deactivate dependents first
      const dependents = this.getDependents(name)
      for (const depName of dependents) {
        const depStatus = this.statuses.get(depName)
        if (depStatus?.active) {
          await this.deactivate(depName)
        }
      }

      // Update status
      this.updateStatus(name, {
        active: false,
        hasErrors: false,
        errors: []
      })

      console.info(`Plugin deactivated: ${name}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.updateStatus(name, {
        hasErrors: true,
        errors: [errorMessage],
        lastError: errorMessage
      })
      throw new Error(`Failed to deactivate plugin ${name}: ${errorMessage}`)
    }
  }

  /**
   * Get plugin configuration
   */
  getConfig(name: string): PluginConfig | undefined {
    return this.configs.get(name)
  }

  /**
   * Set plugin configuration
   */
  setConfig(name: string, config: PluginConfig): void {
    this.configs.set(name, {
      ...config,
      updatedAt: Date.now()
    })
  }

  /**
   * Get plugin status
   */
  getStatus(name: string): PluginStatus | undefined {
    return this.statuses.get(name)
  }

  /**
   * Get all plugin statuses
   */
  getAllStatuses(): Map<string, PluginStatus> {
    return new Map(this.statuses)
  }

  /**
   * Update plugin status
   */
  private updateStatus(name: string, updates: Partial<PluginStatus>): void {
    const current = this.statuses.get(name)
    if (current) {
      this.statuses.set(name, { ...current, ...updates })
    }
  }

  /**
   * Get plugins that depend on the specified plugin
   */
  private getDependents(name: string): string[] {
    const dependents: string[] = []
    
    for (const [pluginName, plugin] of this.plugins) {
      if (plugin.dependencies?.includes(name)) {
        dependents.push(pluginName)
      }
    }
    
    return dependents
  }

  /**
   * Get dependency graph
   */
  getDependencyGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>()
    
    for (const [name, plugin] of this.plugins) {
      graph.set(name, plugin.dependencies || [])
    }
    
    return graph
  }

  /**
   * Resolve plugin load order based on dependencies
   */
  resolveLoadOrder(): string[] {
    const graph = this.getDependencyGraph()
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const result: string[] = []

    const visit = (name: string): void => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving plugin: ${name}`)
      }

      visiting.add(name)
      
      const dependencies = graph.get(name) || []
      for (const dep of dependencies) {
        if (!graph.has(dep)) {
          throw new Error(`Plugin ${name} depends on ${dep}, but ${dep} is not registered`)
        }
        visit(dep)
      }

      visiting.delete(name)
      visited.add(name)
      result.push(name)
    }

    for (const name of graph.keys()) {
      visit(name)
    }

    return result
  }

  /**
   * Export plugin configuration
   */
  exportConfig(): { plugins: PluginConfig[] } {
    const plugins: PluginConfig[] = []
    
    for (const [name, config] of this.configs) {
      plugins.push({
        ...config,
        name
      } as PluginConfig & { name: string })
    }
    
    return { plugins }
  }

  /**
   * Import plugin configuration
   */
  importConfig(config: { plugins: PluginConfig[] }): void {
    for (const pluginConfig of config.plugins) {
      if ('name' in pluginConfig) {
        const { name, ...rest } = pluginConfig as PluginConfig & { name: string }
        this.setConfig(name, rest)
      }
    }
  }

  /**
   * Clear all plugins (useful for testing)
   */
  clear(): void {
    this.plugins.clear()
    this.configs.clear()
    this.statuses.clear()
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    total: number
    active: number
    inactive: number
    withErrors: number
  } {
    const statuses = Array.from(this.statuses.values())
    
    return {
      total: statuses.length,
      active: statuses.filter(s => s.active).length,
      inactive: statuses.filter(s => !s.active).length,
      withErrors: statuses.filter(s => s.hasErrors).length
    }
  }
}