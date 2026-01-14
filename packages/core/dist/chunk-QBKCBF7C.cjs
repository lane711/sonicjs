'use strict';

require('hono');
require('zod');

// src/plugins/sdk/plugin-builder.ts
var PluginBuilder = class _PluginBuilder {
  plugin;
  constructor(options) {
    this.plugin = {
      name: options.name,
      version: options.version,
      description: options.description,
      author: options.author,
      dependencies: options.dependencies,
      routes: [],
      middleware: [],
      models: [],
      services: [],
      adminPages: [],
      adminComponents: [],
      menuItems: [],
      hooks: []
    };
  }
  /**
   * Create a new plugin builder
   */
  static create(options) {
    return new _PluginBuilder(options);
  }
  /**
   * Add metadata to the plugin
   */
  metadata(metadata) {
    Object.assign(this.plugin, metadata);
    return this;
  }
  /**
   * Add routes to plugin
   */
  addRoutes(routes) {
    this.plugin.routes = [...this.plugin.routes || [], ...routes];
    return this;
  }
  /**
   * Add a single route to plugin
   */
  addRoute(path, handler, options) {
    const route = {
      path,
      handler,
      ...options
    };
    this.plugin.routes = [...this.plugin.routes || [], route];
    return this;
  }
  /**
   * Add middleware to plugin
   */
  addMiddleware(middleware) {
    this.plugin.middleware = [...this.plugin.middleware || [], ...middleware];
    return this;
  }
  /**
   * Add a single middleware to plugin
   */
  addSingleMiddleware(name, handler, options) {
    const middleware = {
      name,
      handler,
      ...options
    };
    this.plugin.middleware = [...this.plugin.middleware || [], middleware];
    return this;
  }
  /**
   * Add models to plugin
   */
  addModels(models) {
    this.plugin.models = [...this.plugin.models || [], ...models];
    return this;
  }
  /**
   * Add a single model to plugin
   */
  addModel(name, options) {
    const model = {
      name,
      ...options
    };
    this.plugin.models = [...this.plugin.models || [], model];
    return this;
  }
  /**
   * Add services to plugin
   */
  addServices(services) {
    this.plugin.services = [...this.plugin.services || [], ...services];
    return this;
  }
  /**
   * Add a single service to plugin
   */
  addService(name, implementation, options) {
    const service = {
      name,
      implementation,
      ...options
    };
    this.plugin.services = [...this.plugin.services || [], service];
    return this;
  }
  /**
   * Add admin pages to plugin
   */
  addAdminPages(pages) {
    this.plugin.adminPages = [...this.plugin.adminPages || [], ...pages];
    return this;
  }
  /**
   * Add a single admin page to plugin
   */
  addAdminPage(path, title, component, options) {
    const page = {
      path,
      title,
      component,
      ...options
    };
    this.plugin.adminPages = [...this.plugin.adminPages || [], page];
    return this;
  }
  /**
   * Add admin components to plugin
   */
  addComponents(components) {
    this.plugin.adminComponents = [...this.plugin.adminComponents || [], ...components];
    return this;
  }
  /**
   * Add a single admin component to plugin
   */
  addComponent(name, template, options) {
    const component = {
      name,
      template,
      ...options
    };
    this.plugin.adminComponents = [...this.plugin.adminComponents || [], component];
    return this;
  }
  /**
   * Add menu items to plugin
   */
  addMenuItems(items) {
    this.plugin.menuItems = [...this.plugin.menuItems || [], ...items];
    return this;
  }
  /**
   * Add a single menu item to plugin
   */
  addMenuItem(label, path, options) {
    const menuItem = {
      label,
      path,
      ...options
    };
    this.plugin.menuItems = [...this.plugin.menuItems || [], menuItem];
    return this;
  }
  /**
   * Add hooks to plugin
   */
  addHooks(hooks) {
    this.plugin.hooks = [...this.plugin.hooks || [], ...hooks];
    return this;
  }
  /**
   * Add a single hook to plugin
   */
  addHook(name, handler, options) {
    const hook = {
      name,
      handler,
      ...options
    };
    this.plugin.hooks = [...this.plugin.hooks || [], hook];
    return this;
  }
  /**
   * Add lifecycle hooks
   */
  lifecycle(hooks) {
    Object.assign(this.plugin, hooks);
    return this;
  }
  /**
   * Build the plugin
   */
  build() {
    if (!this.plugin.name || !this.plugin.version) {
      throw new Error("Plugin name and version are required");
    }
    return this.plugin;
  }
};

exports.PluginBuilder = PluginBuilder;
//# sourceMappingURL=chunk-QBKCBF7C.cjs.map
//# sourceMappingURL=chunk-QBKCBF7C.cjs.map