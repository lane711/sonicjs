# SonicJs Headless CMS

# Overview
## SonicJs: Empowering Global API Performance with Cloudflare Workers

Experience the power of SonicJs, a cutting-edge Headless CMS built on the robust Cloudflare Workers platform. SonicJs revolutionizes API performance, delivering an astounding average speed improvement of 🔥🔥🔥 6 times faster 🔥🔥🔥 than a standard node application.

Read the docs here [https://sonicjs.com]

# Prerequisites
1. You will need a free Cloudflare account: [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
1. Install Wrangler CLI:
```
npm install -g wrangler
```

# Getting Started
```
git clone https://github.com/lane711/sonicjs
cd sonicjs
npm install
```

Update the account id and KV namespace in your wrangler.toml file:
```
# Enter your account id
# This can be found at https://dash.cloudflare.com/ --> Workers & Pages --> Overview, then in the right sidebar
account_id = "xxx"

# Run the `wrangler kv:namespace create sonicjs` command and copy the id below
# Run the `wrangler kv:namespace create sonicjs --preview` command and copy the preview_id below
# Only update the preview_id and id, leave the binding name as "KVDATA"
kv_namespaces = [
  { binding = "KVDATA", preview_id="xxx", id = "xxx" }
]
```

```
npm run dev
```
Run the admin interface at:
[http://localhost:8788](http://localhost:8788)

# Legacy
The legacy version of SonicJs (a Node.js based web content management system) can be found here:
[https://github.com/lane711/sonicjs/tree/legacy](https://github.com/lane711/sonicjs/tree/legacy)