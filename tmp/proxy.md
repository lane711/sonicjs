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

Then async update all affected caches

# Key Tracking

Do we need to track all previous urls so that we can rehydrate?




# KV Dependencies

We must every dependency for each record in the source database

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