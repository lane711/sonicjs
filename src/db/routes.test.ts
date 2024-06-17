import { apiConfig } from './routes';
it('Should API Config be defined', () => {
  console.log('apiConfig', apiConfig);
  expect(apiConfig).toBeDefined();
});

// export const apiConfig: ApiConfig[] = [
//   { table: "users", route: "users" },
//   { table: "posts", route: "posts" },
//   { table: "categories", route: "categories" },
//   { table: "comments", route: "comments" },
//   { table: "categoriesToPosts", route: "categories-to-posts" },
// ];
