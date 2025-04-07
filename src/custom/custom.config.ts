import * as posts from "@custom/db/schema/posts";
import * as comments from "@custom/db/schema/comments";
import * as categories from "@custom/db/schema/categories";
import * as categoriesToPosts from "@custom/db/schema/categoriesToPosts";


export const tableSchemas = {
    posts,
    comments,
    categories,
    categoriesToPosts,
    users, // Core table schema DO NOT REMOVE
    userSessions, // Core table schema DO NOT REMOVE
    cacheRequests, // Core table schema DO NOT REMOVE
    cacheStats, // Core table schema DO NOT REMOVE
};

// Export all constants from posts
export const {
    table: postsTable,
    relation: postsRelation,
} = posts;

// Export all constants from comments
export const {
    table: commentsTable,
    relation: commentsRelation,
} = comments;

// Export all constants from categories
export const {
    table: categoriesTable,
} = categories;

// Export all constants from categoriesToPosts
export const {
    table: categoriesToPostsTable,
    relation: categoriesToPostsRelation,
} = categoriesToPosts;



// Core table schemas DO NOT EDIT BELOW THIS LINE

import * as users from "../db/schema/users";
import * as userSessions from "../db/schema/userSessions";
import * as cacheRequests from "../db/schema/cacheRequests";
import * as cacheStats from "../db/schema/cacheStats";

// Export all constants from users
export const {
    table: usersTable,
    relation: usersRelation,
} = users;

// Export all constants from userSessions
export const {
    table: userSessionsTable,
    relation: userSessionsRelation,
} = userSessions;

// Export all constants from cacheRequests
export const {
    table: cacheRequestsTable,
} = cacheRequests;

// Export all constants from cacheStats
export const {
    table: cacheStatsTable,
    relation: cacheStatsRelation,
} = cacheStats;