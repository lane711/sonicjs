
# Access Control

The `access` property defines access control rules for interacting with the data. It allows granular control over who can perform what actions.

By default operations are always allowed.

## Admin Panel Access

In `schema.ts` a variable `config` should be exported with a `adminAccessControl` property.

```js
export type SonicJSConfig = {
  tablesConfig: ApiConfig[];
  adminAccessControl: (ctx: AppContext) => boolean;
};
```
If `adminAccessControl` returns `true` the user will be allowed access to the /admin route and be able to perform operations like clearing cache.

## Operation Access

The `operation` property controls access to CRUD operations. It contains sub-properties for each operation:

- ctx: AppContext  

- id: the id of the document (or undefined if reading multiple rows)

- data: the data passed to the update/create operation

### Create

- `create: boolean | (ctx?: AppContext, data?: any) => boolean | Promise<boolean>`
  - Used to check if the user can create the provided input 
  - Should return `true` to allow create or `false` to deny

### Read

- `read: boolean | (ctx?: AppContext, id?: string) => boolean | Promise<boolean>`
  - Determines if reading/querying items is allowed

### Update

- `update: boolean | (ctx?: AppContext, id?: string, data:any) => boolean | Promise<boolean>`
  - Determines if updating items is allowed

### Delete 

- `delete: boolean | (ctx: AppContext, id: string) => boolean | Promise<boolean>`
  - Determines if deleting items is allowed


## Filter Access 

The `filter` property allows modifying the data returned from CRUD operations by applying additional filters. It contains sub-properties for each operation:

- ctx: AppContext  

- id: the id of the document (or undefined if reading multiple rows)

- data: the data passed to the update/create operation


### Read

- `read: SonicJSFilter | ((ctx?: AppContext, id?: string) => SonicJSFilter | Promise<SonicJSFilter>) | boolean | ((ctx: AppContext, id: string) => boolean | Promise<boolean>)`

- Allows modifying the data returned on a read by adding filters

- Should return a filter or boolean to allow/deny reading

### Update 

- `update: SonicJSFilter | ((ctx?: AppContext, id?: string, data?: any) => SonicJSFilter | Promise<SonicJSFilter>) | boolean | ((ctx?: AppContext, id?: string, data?: any) => boolean | Promise<boolean>)`
  
- Allows modifying the data passed to an update by adding filters

- Should return a filter or boolean to allow/deny updating

### Delete

- `delete: SonicJSFilter | ((ctx?: AppContext, id?: string) => SonicJSFilter | Promise<SonicJSFilter>) | boolean | ((ctx?: AppContext, id?: string) => boolean | Promise<boolean>)`

- Allows modifying delete operation by adding filters 

- Should return a filter or boolean to allow/deny deleting

## Item Access

The `item` property allows more granular access control based on the document being accessed. 

Also less performant access control because the doc being requested/updated/deleted is read passed in

It contains sub-properties for each operation:

- ctx: AppContext
- id: the id of the document  
- data: the data passed to the update/create operation
- doc: the document being accessed

### Read

- `read: boolean | (ctx?: AppContext, id?: string, doc?: any) => boolean | Promise<boolean>`

- Allows checking the actual document content to determine read access

- Should return `true` to allow read or `false` to deny

### Update

- `update: boolean | (ctx?: AppContext, id?: string, data?: any, doc?: any) => boolean | Promise<boolean>`
  
- Allows checking the actual document content to determine update access

- Should return `true` to allow update or `false` to deny

### Delete

- `delete: boolean | (ctx?: AppContext, id?: string, doc?: any) => boolean | Promise<boolean>`

- Allows checking the actual document content to determine delete access
  
- Should return `true` to allow delete or `false` to deny


## Field Level Access

The `fields` property controls access at the individual field level. It contains sub-properties for each field name.

- ctx: AppContext  

- id: the id of the document  

- data: the data passed to the update/create operation

- value: the value of the field  

### Create

- `create: boolean | (ctx?: AppContext, data?: any) => boolean | Promise<boolean>`

- Used to check if the field can be set on create

- Should return `true` to allow setting the field or `false` to discard the value

### Read

- `read: boolean | (ctx?: AppContext, value?: any, doc?: any) => boolean | Promise<boolean>`  

- Determines if reading the field is allowed

- Should return `true` to return the field or `false` to omit 

### Update

- `update: boolean | (ctx?: AppContext, id?: string, data?: any) => boolean | Promise<boolean>`

- Used to check if the field can be updated

- Should return `true` to allow update or `false` to discard the value

## AppContext

The context provides user, role, group, etc information to use in the access control checks.

It is passed to all the access functions. Its shape depends on your application's auth implementation.

Get the user: `ctx.get("user")`
Get the session: `ctx.get("session")`


## Example


```

The config defines access control rules for each table endpoint. 

### Users Table

The users table has more complex access control since it stores user account data:

- Operation Access:
  - Create is restricted to admins only
  - Delete is restricted to admins only

- Item Level Access:
  - Update checks if the user is an admin or updating their own user account via the `isAdminOrUser` function

- Field Level Access: 
  - Id, email, password, role have detailed field level access control:

    - Id:
      - Read access allowed for admin/editors or user reading their own id

    - Email: 
      - Read access allowed only for admin/user reading their own email

    - Password:
      - Update allowed for admin/user updating their own password  

    - Role:
      - Read access allowed for admin/user reading their own role
      - Update restricted to just admins

So in summary:

- CRUD is restricted for normal users
- Users can view/update their own user account
- Admins have full access
- Sensitive fields like role, email are protected from unauthorized access

### Posts Table

- Operation Access:
  - Read is allowed for everyone (set to true)
  - Create is allowed only for admins and editors via the `isAdminOrEditor` function
- Filter Access: 
  - Updates and deletes apply a filter to restrict access based on the userId not matching the logged in user. This prevents unauthorized updates/deletes.

- Field Level Access:
  - The userId field cannot be updated directly. This prevents changing the post owner.

- Hooks:
  - On create/update, it will set the userId field based on the logged in user.


export const apiConfig: ApiConfig[] = [
  {
    table: "posts",
    route: "posts",
    access: {
      operation: {
        read: true,
        create: isAdminOrEditor,
      },
      filter: {
        // if a user tries to update a post and isn't the user that created the post the update won't happen
        update: (ctx) => {
          if (isAdmin(ctx)) {
            return true;
          } else {
            const user = ctx.get("user");
            if (user?.userId) {
              // Return filter so update doesn't happen if userId doesn't match
              return {
                userId: user.userId,
              };
            } else {
              return false;
            }
          }
        },
        delete: (ctx) => {
          if (isAdmin(ctx)) {
            return true;
          } else {
            const user = ctx.get("user");
            if (user?.userId) {
              // Return filter so update doesn't happen if userId doesn't match
              return {
                userId: user.userId,
              };
            } else {
              return false;
            }
          }
        },
      },
      fields: {
        userId: {
          update: false,
        },
      },
    },
    hooks: {
      resolveInput: {
        create: (ctx, data) => {
          if (ctx.get("user")?.userId) {
            data.userId = ctx.get("user").userId;
          }
          return data;
        },
        update: (ctx, id, data) => {
          if (ctx.get("user")?.userId) {
            data.userId = ctx.get("user").userId;
          }
          return data;
        },
      },
    },
  },
  {
    table: "categories",
    route: "categories",
    access: {
      operation: {
        read: true,
        create: true,
        update: isAdminOrEditor,
        delete: isAdminOrEditor,
      },
    },
  },
  {
    table: "comments",
    route: "comments",
    access: {
      operation: {
        read: true,
        create: true,
        update: isAdminOrUser,
        delete: isAdminOrUser,
      },
    },
  },
  {
    table: "categoriesToPosts",
    route: "categories-to-posts",
    access: {
      operation: {
        read: true,
        create: true,
        update: isAdminOrEditor,
        delete: isAdminOrEditor,
      },
    },
  },
  {
    table: "users",
    route: "users",
    access: {
      operation: {
        create: isAdmin,
        delete: isAdmin,
      },
      item: {
        // if a user tries to update a user and isn't the user that created the user the update will return unauthorized response
        update: isAdminOrUser,
      },
      fields: {
        id: {
          read: (ctx, value, doc) => {
            return isAdminOrEditor(ctx) || isAdminOrUser(ctx, doc.id);
          },
        },
        email: {
          read: (ctx, value, doc) => {
            return isAdminOrUser(ctx, doc.id);
          },
        },
        password: {
          update: isAdminOrUser,
        },
        role: {
          read: (ctx, value, doc) => {
            return isAdminOrUser(ctx, doc.id);
          },
          update: isAdmin,
        },
      },
    },
  },
];


export function isAdminOrEditor(ctx: AppContext) {
  const user = ctx.get("user");
  const role = user?.role?.toLowerCase() || "";
  if (role === "admin" || role === "editor") {
    return true;
  }
  return false;
}

export function isAdmin(ctx: AppContext) {
  const user = ctx.get("user");
  const role = user?.role?.toLowerCase() || "";
  if (role === "admin") {
    return true;
  }
  return false;
}

export function isUser(ctx: AppContext, id: string) {
  const user = ctx.get("user");
  return user.userId === id;
}

export function isAdminOrUser(ctx: AppContext, id: string) {
  return isAdmin(ctx) || isUser(ctx, id);
}

```