import * as user from "./definitions/user";
import * as post from "./definitions/post";
import * as comment from "./definitions/comment";
import * as category from "./definitions/category";
import * as categoriesToPost from "./definitions/categoriesToPost";

import * as users from "./schema/users";
import * as posts from "./schema/posts";
import * as comments from "./schema/comments";
import * as categories from "./schema/categories";
import * as categoriesToPosts from "./schema/categoriesToPosts";

export interface ApiConfig {
  table: string;
  route: string;
}
export const apiConfig: ApiConfig[] = [];
export const tableSchemaMap = new Map();
export const tableDefinitions = [
  user,
  post,
  comment,
  category,
  categoriesToPost,
];
export const tableSchemas = [
  users,
  posts,
  comments,
  categories,
  categoriesToPosts,
];
for (const [index, table] of tableDefinitions.entries()) {
  tableSchemaMap.set(table.tableName, tableSchemas[index].default);
  apiConfig.push({
    table: table.tableName,
    route: table.route,
  });
}
