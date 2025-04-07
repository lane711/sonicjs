import * as posts from "@custom/db/schema/posts";
import * as comments from "@custom/db/schema/comments";
import * as categories from "@custom/db/schema/categories";
import * as categoriesToPosts from "@custom/db/schema/categoriesToPosts";
import * as users from "../db/schema/users";
import * as userSessions from "../db/schema/userSessions";
import * as cacheRequests from "../db/schema/cacheRequests";
import * as cacheStats from "../db/schema/cacheStats";

export const tableSchemas = {
    posts,
    comments,
    categories,
    categoriesToPosts,
    users,
    userSessions,
    cacheRequests,
    cacheStats,
};

// Export all constants from posts
export const {
    tableName: postsTableName,
    route: postsRoute,
    name: postsName,
    icon: postsIcon,
    definition: postsDefinition,
    table: postsTable,
    relation: postsRelation,
    access: postsAccess,
    hooks: postsHooks,
    fields: postsFields,
} = posts;

// Export all constants from comments
export const {
    tableName: commentsTableName,
    route: commentsRoute,
    name: commentsName,
    icon: commentsIcon,
    definition: commentsDefinition,
    table: commentsTable,
    relation: commentsRelation,
    access: commentsAccess,
    hooks: commentsHooks,
    fields: commentsFields,
} = comments;

// Export all constants from categories
export const {
    tableName: categoriesTableName,
    route: categoriesRoute,
    name: categoriesName,
    icon: categoriesIcon,
    definition: categoriesDefinition,
    table: categoriesTable,
    access: categoriesAccess,
    fields: categoriesFields,
} = categories;

// Export all constants from categoriesToPosts
export const {
    tableName: categoriesToPostsTableName,
    route: categoriesToPostsRoute,
    name: categoriesToPostsName,
    icon: categoriesToPostsIcon,
    definition: categoriesToPostsDefinition,
    table: categoriesToPostsTable,
    relation: categoriesToPostsRelation,
    access: categoriesToPostsAccess,
} = categoriesToPosts;

// Export all constants from users
export const {
    tableName: usersTableName,
    route: usersRoute,
    name: usersName,
    icon: usersIcon,
    definition: usersDefinition,
    table: usersTable,
    relation: usersRelation,
    access: usersAccess,
    hooks: usersHooks,
} = users;

// Export all constants from userSessions
export const {
    tableName: userSessionsTableName,
    name: userSessionsName,
    definition: userSessionsDefinition,
    table: userSessionsTable,
    relation: userSessionsRelation,
} = userSessions;

// Export all constants from cacheRequests
export const {
    tableName: cacheRequestsTableName,
    route: cacheRequestsRoute,
    name: cacheRequestsName,
    icon: cacheRequestsIcon,
    definition: cacheRequestsDefinition,
    table: cacheRequestsTable,
    access: cacheRequestsAccess,
    fields: cacheRequestsFields,
} = cacheRequests;

// Export all constants from cacheStats
export const {
    tableName: cacheStatsTableName,
    route: cacheStatsRoute,
    name: cacheStatsName,
    icon: cacheStatsIcon,
    definition: cacheStatsDefinition,
    table: cacheStatsTable,
    relation: cacheStatsRelation,
    access: cacheStatsAccess,
    fields: cacheStatsFields,
} = cacheStats;