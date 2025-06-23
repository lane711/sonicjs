import { Hono } from 'hono'
// import { OpenAPIGenerator } from '../utils/openapi-generator'
import { schemaDefinitions } from '../schemas'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

export const docsRoutes = new Hono<{ Bindings: Bindings }>()

// TODO: Re-enable OpenAPI generator after fixing TypeScript issues
// const openAPIGenerator = new OpenAPIGenerator()
// schemaDefinitions.forEach(schema => {
//   openAPIGenerator.registerSchema(schema)
// })

// Temporary OpenAPI JSON spec
docsRoutes.get('/openapi.json', (c) => {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'SonicJS AI API',
      version: '1.0.0',
      description: 'Auto-generated REST API for SonicJS AI headless CMS'
    },
    servers: [{ url: '/api', description: 'API Server' }],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      schemas: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return c.json(spec)
})

// Scalar API documentation UI
docsRoutes.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SonicJS AI API Documentation</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { margin: 0; }
        </style>
      </head>
      <body>
        <script
          id="api-reference"
          data-url="/docs/openapi.json"
          data-configuration='{"theme":"purple"}'
        ></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
  `)
})

// Alternative Swagger UI
docsRoutes.get('/swagger', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="SwaggerUI" />
        <title>SonicJS AI API Documentation</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js" crossorigin></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              url: '/docs/openapi.json',
              dom_id: '#swagger-ui',
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone,
              ],
              layout: "StandaloneLayout",
            });
          };
        </script>
      </body>
    </html>
  `)
})