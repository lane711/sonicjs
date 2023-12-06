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

Now you're ready to fire up SonicJs!

```
npm run dev
```
Run the admin interface at:
[http://localhost:8788](http://localhost:8788)

Check out https://sonicjs.com for next steps.

# Authentication

To enable password auth set `useAuth` to "true" and a AUTH_SECRET in your vars in wrangler.toml

Set the AUTH_SECRET (A random string is used to hash tokens)
You can quickly create a good value on the command line via this openssl command.

```
$ openssl rand -base64 32
```
Note: 

Hashing a password is purposefully computationally expensive in order to make passwords hard to crack if bad actors ever get access to the encrypted password. 

In my testing creating a user/logging in takes around 100ms CPU time. I have never gotten a Exceeded CPU Limits error even on the free plan because Cloudflare allows rollover CPU time for requests below the CPU limit, and most SonicJS requests are well under.

That said if you do get errors you may need to set the env variable AUTH_ITERATIONS and/or AUTH_HASH if your worker is running longer than allowed. The default and max AUTH_ITERATIONS is "100000". AUTH_HASH must be "SHA_256", "SHA-384" or "SHA-512" ("SHA-512" is the default)

e.g to use use less CPU time
AUTH_ITERATIONS="50000"
AUTH_HASH="SHA-256"

 [https://sonicjs.com/environment-variables](https://sonicjs.com/environment-variables)

  1. Navigate to the Auth Users section in the left nav (/admin/tables/auth/users)
  1. If you don't have a user create one with the role "admin" and set a password
  1. If you have users already edit the user you want to be the admin, set the role to "admin" and set a password
  1. Login
  1. You now have admin dashboard for CRUD operations
  1. To authorize via the API post to /v1/auth/login which will return json like

    ```json
    {
      "bearer": "eo0t9q52njemo83rm1qktr6kwjh8zu5o3vma1g6j"
    }
    ```
  1. Then add that bearer token to the Authorization header on future requests


    ```ts
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

## Roles
By default the recognized roles are "admin" and "editor". admin can do all CRUD operations on anything and access the admin dashboard. editor is the same except they can't see/edit other users.

See `adminRole`, `editorRole` and `adminAccessRoles` in src/db/schema.ts for customization.
Also see src/cms/auth/auth-helpers.ts for functions called from the apis to enable this if you need more customization.

Note if no user has the admin role then all users are considered admins.

## Public Permissions
The apiConfig has a publicPermissions field for CRUD operations



# Legacy
The legacy version of SonicJs (a Node.js based web content management system) can be found here:
[https://github.com/lane711/sonicjs/tree/legacy](https://github.com/lane711/sonicjs/tree/legacy)
