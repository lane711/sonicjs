'use strict';

var hono = require('hono');
var zod = require('zod');

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
var PluginHelpers = class {
  /**
   * Create a REST API route for a model.
   *
   * @experimental This method returns placeholder routes. Full implementation coming soon.
   */
  static createModelAPI(modelName, options) {
    const app = new hono.Hono();
    options?.basePath || `/${modelName.toLowerCase()}`;
    app.get("/", async (c) => {
      return c.json({ message: `List ${modelName} items` });
    });
    app.get("/:id", async (c) => {
      const id = c.req.param("id");
      return c.json({ message: `Get ${modelName} with ID: ${id}` });
    });
    app.post("/", async (c) => {
      return c.json({ message: `Create new ${modelName}` });
    });
    app.put("/:id", async (c) => {
      const id = c.req.param("id");
      return c.json({ message: `Update ${modelName} with ID: ${id}` });
    });
    app.delete("/:id", async (c) => {
      const id = c.req.param("id");
      return c.json({ message: `Delete ${modelName} with ID: ${id}` });
    });
    return app;
  }
  /**
   * Create an admin CRUD interface for a model.
   *
   * @experimental This method generates basic admin page structures. Full implementation coming soon.
   */
  static createAdminInterface(modelName, options) {
    const basePath = `/admin/${modelName.toLowerCase()}`;
    const displayName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    const pages = [
      {
        path: basePath,
        title: `${displayName} List`,
        component: `${modelName}List`,
        permissions: options?.permissions,
        icon: options?.icon
      },
      {
        path: `${basePath}/new`,
        title: `New ${displayName}`,
        component: `${modelName}Form`,
        permissions: options?.permissions
      },
      {
        path: `${basePath}/:id`,
        title: `Edit ${displayName}`,
        component: `${modelName}Form`,
        permissions: options?.permissions
      }
    ];
    const menuItems = [
      {
        label: displayName,
        path: basePath,
        icon: options?.icon,
        permissions: options?.permissions
      }
    ];
    return { pages, menuItems };
  }
  /**
   * Create a database migration for a model
   */
  static createMigration(tableName, fields) {
    const columns = fields.map((field) => {
      let definition = `${field.name} ${field.type}`;
      if (field.primaryKey) definition += " PRIMARY KEY";
      if (field.unique) definition += " UNIQUE";
      if (!field.nullable && !field.primaryKey) definition += " NOT NULL";
      if (field.defaultValue) definition += ` DEFAULT ${field.defaultValue}`;
      return definition;
    }).join(",\n  ");
    return `
CREATE TABLE IF NOT EXISTS ${tableName} (
  ${columns},
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TRIGGER IF NOT EXISTS ${tableName}_updated_at
  AFTER UPDATE ON ${tableName}
BEGIN
  UPDATE ${tableName} SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;
    `.trim();
  }
  /**
   * Create a Zod schema for a model
   */
  static createSchema(fields) {
    const shape = {};
    const applyValidation = (field, schema) => {
      if (field.validation) {
        if (field.type === "string" && field.validation.min) {
          schema = schema.min(field.validation.min);
        }
        if (field.type === "string" && field.validation.max) {
          schema = schema.max(field.validation.max);
        }
        if (field.type === "string" && field.validation.email) {
          schema = schema.email();
        }
        if (field.type === "string" && field.validation.url) {
          schema = schema.url();
        }
      }
      return schema;
    };
    const buildSchema = (field) => {
      let schema;
      switch (field.type) {
        case "string":
          schema = zod.z.string();
          break;
        case "number":
          schema = zod.z.number();
          break;
        case "boolean":
          schema = zod.z.boolean();
          break;
        case "date":
          schema = zod.z.date();
          break;
        case "array":
          if (field.items?.blocks && typeof field.items.blocks === "object") {
            const discriminator = typeof field.items.discriminator === "string" && field.items.discriminator ? field.items.discriminator : "blockType";
            const blockSchemas = Object.entries(field.items.blocks).map(([blockName, blockDef]) => {
              const properties = blockDef?.properties && typeof blockDef.properties === "object" ? blockDef.properties : {};
              const blockShape = {
                [discriminator]: zod.z.literal(blockName)
              };
              Object.entries(properties).forEach(([propertyName, propertyConfigRaw]) => {
                const propertyConfig = propertyConfigRaw && typeof propertyConfigRaw === "object" ? propertyConfigRaw : {};
                const propertySchema = buildSchema({
                  ...propertyConfig,
                  optional: propertyConfig.required === false
                });
                blockShape[propertyName] = propertySchema;
              });
              return zod.z.object(blockShape);
            });
            if (blockSchemas.length === 1 && blockSchemas[0]) {
              schema = zod.z.array(blockSchemas[0]);
            } else if (blockSchemas.length > 1) {
              schema = zod.z.array(zod.z.union(blockSchemas));
            } else {
              schema = zod.z.array(zod.z.any());
            }
            break;
          }
          if (field.items) {
            schema = zod.z.array(buildSchema(field.items));
            break;
          }
          schema = zod.z.array(zod.z.any());
          break;
        case "object":
          if (field.properties && typeof field.properties === "object") {
            const objectShape = {};
            Object.entries(field.properties).forEach(([propertyName, propertyConfigRaw]) => {
              const propertyConfig = propertyConfigRaw && typeof propertyConfigRaw === "object" ? propertyConfigRaw : {};
              objectShape[propertyName] = buildSchema({
                ...propertyConfig,
                optional: propertyConfig.required === false
              });
            });
            schema = zod.z.object(objectShape);
            break;
          }
          schema = zod.z.object({});
          break;
        default:
          schema = zod.z.any();
      }
      schema = applyValidation(field, schema);
      if (field.optional || field.required === false) {
        schema = schema.optional();
      }
      return schema;
    };
    for (const field of fields) {
      shape[field.name] = buildSchema(field);
    }
    return zod.z.object(shape);
  }
};

exports.PluginBuilder = PluginBuilder;
exports.PluginHelpers = PluginHelpers;
//# sourceMappingURL=chunk-YHW27CBV.cjs.map
//# sourceMappingURL=chunk-YHW27CBV.cjs.map