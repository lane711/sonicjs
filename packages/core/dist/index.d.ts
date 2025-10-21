// Main exports from @sonicjs-cms/core package
export * from '../src/index'

// Explicitly re-export key types and classes
export type { Plugin, PluginContext } from '../src/types/index'
export { TemplateRenderer, templateRenderer, renderTemplate } from '../src/utils/template-renderer'
