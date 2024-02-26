# SonicJs Headless CMS

# Overview
## SonicJs: Empowering Global API Performance with Cloudflare Workers

Experience the power of SonicJs, a cutting-edge Headless CMS built on the robust Cloudflare Workers platform. SonicJs revolutionizes API performance, delivering an astounding average speed improvement of 🔥🔥🔥 6 times faster 🔥🔥🔥 than a standard node application.

Read the docs here [https://sonicjs.com]

## How Fast is "Blazingly" Fast?

| Platform      | Average Response Time | Difference |
| ----------- | ----------- | ----------- |
| Strapi      | 342.1ms       | - baseline - |
| Node + Postgres   | 320.2ms        | 1.06x Faster|
| SonicJs   | 52.7ms        | 6.4x Faster|

The details of our performance benchmark here is available at
[here](/performance-benchmarks). 

# Prerequisites
1. You will need a free Cloudflare account: [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
1. Install Wrangler CLI:
```
npm install -g wrangler
```
3. You will need to have four Cloudflare values during the first step of **Getting Started**:
    * Cloudflare account id which is your 32 character id at the end of your [https://dash.cloudflare.com/](https://dash.cloudflare.com/) url
    * For Cloudflare kv namespace id enter the following command in powershell as admin: 
      ```
      wrangler kv:namespace create sonicjs
      ```
    * Cloudflare kv namespace preview id enter the following command in powershell as admin: 
      ```
      wrangler kv:namespace create SonicJS --preview
      ```
    * Cloudflare database id enter the following command in powershell as admin: 
      ```
      wrangler d1 create SonicJS
      ```
If you receive the error:
`wrangler.ps1 cannot be loaded because running scripts is disabled on this system.`

Run this command on powershell as administrator and try running the wrangler commands from step 3:
```
Set-ExecutionPolicy RemoteSigned
```
If you already created a namespace and need to see your namespace id do:
```
wrangler kv:namespace list 
```

# Getting Started
```
npx create-sonicjs-app
```

Follow the installation script prompts to enter the required Cloudflare values.

One last step; we need to run the migration scripts to create our database tables:
```
npm run up
```

Now you're ready to fire up SonicJs!
```
npm run dev
```

Open the admin interface at:
[http://localhost:8788](http://localhost:8788)

Check out https://sonicjs.com/getting-started for next steps.


# Array Fields

Configure array fields by first telling drizzle that the field is an array field.

```js
  tags: text("tags", { mode: "json" }).$type<string[]>(),
```
Then configure the field in the exported `fields` variable from a table file.
```js
export const fields: ApiConfig["fields"] = {
  tags: {
    type: "string[]",
  },
};
```

# R2 File Upload 

## File fields

Configure file fields in the exported `fields` variable from a table file.

You can configure which bucket to use to upload to as well as the path to store the file in the bucket when uploaded from that field.

Picking an existing file is also an option on the form, it will list any other files in that same bucket and path.

```js
export const definition = {
  id: text("id").primaryKey(),
  title: text("title"),
  body: text("body"),
  userId: text("userId"),
  image: text("image"),
  images: text("images", { mode: "json" }).$type<string[]>(),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
};
export const fields: ApiConfig["fields"] = {
  image: {
    type: "file",
    bucket: (ctx) => ctx.env.R2STORAGE,
    path: "images",
  },
  images: {
    type: "file[]",
    bucket: (ctx) => ctx.env.R2STORAGE,
    path: "images",
  },
  tags: {
    type: "string[]",
  },
};

```

## [Tus API](https://tus.io/)

A [tus api](https://tus.io/) is available for uploading files. The tus api is available at `/tus`.  
In addition to the normal tus api 3 headers should be passed in the request to properly handle finding the correct bucket, the path to store the file, permissions, hooks, etc.
  - sonic-route - the route of the table the file is being uploaded to e.g 'posts'
  - sonic-field - the field name of the file e.g. 'image'
  - sonic-mode - should be 'create' if calling manually

# Authentication


**Important:** There are two options for how passwords are stored (key derivation functions), set by the AUTH_KDF env variable. These effect the security of your passwords if they were to ever leak, as well as how much cpu time is used when a user is created, changes their password, or logs in. 

  - **AUTH_KDF="pbkdf2"**
    - The default if no env variable is set
    - Faster than scrypt, but less secure
    - Uses about 80-100ms CPU time
    - Recommended if on cloudflare workers free plan
      - Since cloudflare allows rollover CPU time you are unlikely to get an Exceeded CPU Limits error, but you can adjust the options below to potentially use less CPU time
    - Can adjust iterations with the AUTH_ITERATIONS env variable (default and max 100000)
    - Can adjust hash with the AUTH_HASH env variable ("SHA_256", "SHA-384" or "SHA-512" ("SHA-512" is the default))
  - **AUTH_KDF="scrypt"**
    - Slower than pbkdf2, but more secure
    - Uses about 300-400ms CPU time
    - Recommended if on cloudflare workers paid plan

If you change your auth options old users will still be able to login but the encryption won't change for their password until they change their password.

 [https://sonicjs.com/environment-variables](https://sonicjs.com/environment-variables)

## Setup a user
  1. When you first open the app you will be prompted to create an admin user
  1. Create the user and save and you will be redirected to login
  1. Login
  1. You now have admin dashboard for CRUD operations
  1. To authorize via the API post to /v1/auth/login  with the email and password in the body
    ```json
    {
      "email": "user@sonicjs.com",
      "password": "password123"
    }
    ```
  1. The API will return a bearer token
      ```json
      {
        "bearer": "eo0t9q52njemo83rm1qktr6kwjh8zu5o3vma1g6j"
      }
      ```
  1. Then add that bearer token to the Authorization header on future requests
      ```js
       const url = "http://localhost:8788/v1/posts/c1d462a4-fd10-4bdb-bbf2-2b33a94f82aa";
       const data = {
         "data": {
             "title": "Test Post Update"
         }
       };
       const requestOptions = {
         method: 'PUT',
         headers: { 
             'Content-Type': 'application/json',
             'Authorization': 'Bearer eo0t9q52njemo83rm1qktr6kwjh8zu5o3vma1g6j'
         },
         body: JSON.stringify(data)
       };
       fetch(url, requestOptions)
      ```

## [Access Control Configuration](ACCESS-CONTROL.md)

  See the [Access Control Readme](ACCESS-CONTROL.md)


# Hooks

The `hooks` property on the `ApiConfig` type allows configuring functions that run at certain points in the request lifecycle. Here are the available hooks:

## resolveInput

The `resolveInput` hook allows transforming the input data before running a create or update operation. 

```ts
resolveInput: {
  create: (ctx: AppContext, data: any) => any | Promise<any>;
  update: (ctx: AppContext, id: string, data: any) => any | Promise<any>;
}
```

For example, it can be used to automatically populate the `userId` field based on the authenticated user:

```ts
resolveInput: {
  create: (ctx, data) => {
    if (ctx.get("user")?.userId) {
      data.userId = ctx.get("user").userId; 
    }
    return data;
  } 
}
```

The hooks receive the context (`ctx`) containing the request information, as well as the input `data`. They can return a Promise of the transformed data.

## beforeOperation

The `beforeOperation` hook runs before executing the database operation:

```ts  
beforeOperation?: (
  ctx: AppContext,
  operation: "create" | "read" | "update" | "delete", 
  id?: string,
  data?: any  
) => void | Promise<void>;
```

It receives:

- `ctx` - the context
- `operation` - the operation being performed 
- `id` - the document ID (if applies)
- `data` - the input data (if applies)

For example, it can be used for logging.

## afterOperation

The `afterOperation` hook runs after executing the database operation:  

```ts
afterOperation?: (
  ctx: AppContext,
  operation: "create" | "read" | "update" | "delete", 
  id?: string,
  data?: any,
  result?: { data?: any } & Record<string, any>  
) => void | Promise<void>;
```
 
It receives:

- `ctx` - the context
- `operation` - the operation performed
- `id` - the document ID (if applies) 
- `data` - the input data (if applies)
- `result` - the operation result

For example, it can be used for logging or post-processing the result.


# Legacy
The legacy version of SonicJs (a Node.js based web content management system) can be found here:
[https://github.com/lane711/sonicjs/tree/legacy](https://github.com/lane711/sonicjs/tree/legacy)
