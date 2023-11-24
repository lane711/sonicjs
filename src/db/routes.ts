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

export const tableSchemas = {
  users,
  posts,
  comments,
  categories,
  categoriesToPosts,
};

for (const key of Object.keys(tableSchemas)) {
  apiConfig.push({
    table: tableSchemas[key].tableName,
    route: tableSchemas[key].route,
  });
}
