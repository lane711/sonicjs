```
npm install
npm run dev
```

```
npm run deploy
```

------

# D1
```
{
    "id": "123-abc",
    "firstName": "Lane"
}
```

# KV
```
{
    "id": "123-abc",
    "firstName": "Lane"
}
```

# In Memory
Maybe don't use bc we can't update on all nodes. May need to confine cache to kv

# Select

Once we have the data from a GET, we can:
1. Cache it using the Cloudflare cache API
2. Store it in memory (edge servers limited to 128MB)

The challenge is, how do we know when to invalidate the cache?

Is cache api global, if so that is great
Is the cache api per node? if so might as well use memory

If using memory, how to be notified that data has been updated?

maybe go back to KV, and forget in memory caching? what is the latency delta?

maybe use Durable object?

Is KV lookup a slow process, if so maybe manage list of cache urls .

Static Global, page speed plus 180-240 (pingdom ~ 150mx)
KV global, page speed plus, is around 300-400ms (pingdom is < 200ms)
so maybe we can have aggressive setting that caches in local memory maximize low latency

# Update/Delete

Update record "123-abc":
1. Update D1
1. Get List of cache items containing "123-abc"
1. Invalidate cache items from above list
    1. 123-abc | /v1/users?limit=10
    1. 123-abc | /v1/users?firstName=Lane
    1. 123-abc | /v1/users?id=123*
1. Now rehydrate the cache for the affected cache item:
    1. /v1/users?limit=10
    1. /v1/users?firstName=Lane
    1. /v1/users?id=123*

# Insert

Inserts are tricky because any list could be affected.

Do we need to invalidate all lists that have a dependency based on the source table

For example if we insert a new user record, we also need to track all cache item lists that could be impacted by a new user

Anything with a cache key like:
/v1/users*
/v1/users?limit=10
/v1/users?limit=20


Then async update all affected caches

# Key Tracking

Do we need to track all previous urls so that we can rehydrate?

# Lock and Questions
Do we need to prevent close subsequent calls from returning stale data?
maybe use in memory just on node where the update/delete/insert occurs so we can quickly return non stale data
maybe update lists instead of replace? yes - then we don't have to run a query to re-select
but then joins get messy
what is fields are updated that aren't used in joined queries?

if we pass insetts, updates and deletes thru edgecache, will those be materially slower?

what if there is an advanced update that updates several records in multiple tables? How are we supposed to detect cache updates on that? Maybe we nneed to allow the developer to hit our API to manually trigger cache updates in such cases.

Use ML to learn which endpints need to be updated with each PUT/POST/DELETE

# KV Dependencies

We must track every dependency for each record in the source database

We don't need to store any system of record data

|record| url |
| ---- | -----|
|123-abc | /v1/users?limit=10           |
|123-abc | /v1/users?firstName=Lane     |
|123-abc | /v1/users?id=123*            |

|table| url |
| ---- | -----|
|users | /v1/users?limit=10|
|users | /v1/users?firstName=Lane|
|users | /v1/users?id=123*|

|table| url |
| ---- | -----|
|users | /v1/usersWithOrders?limit=10|
|orders | /v1/usersWithOrders?firstName=Lane|

# MVP
 
 ## 1.0 
- GETS - Read only API
- Cache expires after 24 hours by default
- Developers can set their own time to expire
- CLI only, no web app
- Developer must manually invalidate cache

### Process
1. Build MVP
    1. Tenant provisioning
1. Build CLI
1. Reach out to Beta users on LinkedIn
1. Build Marketing Website

## 1.1
- Developer can set cache TTL

## 1.2
- Add dependency tracking (High Effort)

## 1.3
- Use machine learning to determine appropriate cache invalidation

# Technical Requirements