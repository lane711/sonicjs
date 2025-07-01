// Simplified workflow plugin for now
// This plugin is disabled by default and can be activated through the admin interface

export const workflowPlugin = {
  name: 'workflow',
  displayName: 'Workflow Management',  
  description: 'Content workflow management with approval chains, scheduling, and automation',
  version: '1.0.0',
  author: 'SonicJS Team',
  isCore: false,
  isActive: false, // Disabled by default
  
  // Plugin will be loaded through the existing plugin system
  // Routes and admin pages are handled by the main app when plugin is active
}

export default workflowPlugin