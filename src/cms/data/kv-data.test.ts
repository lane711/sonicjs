import { add, getKey,getDataListByPrefix } from "./kv-data";

const env = getMiniflareBindings()

it("getDataListByPrefix should return data", async () => {
  const data = await getDataListByPrefix(env.KVDATA, "", 2);
  console.log('getDataListByPrefix==>', data);
  // expect(key.startsWith("site::module")).toBe(true);
  // expect(key.length).toBe(40);

});

it("should generate a key", () => {
  const key = getKey("site", "module");
  console.log(key);
  expect(key.startsWith("site::module")).toBe(true);
  expect(key.length).toBe(40);

});

it("should generate a key for a content type", () => {
  const key = getKey("", "", "site1::content-type::blog-post");
  // console.log(key);
  expect(key).toBe("site1::content-type::blog-post");
});
