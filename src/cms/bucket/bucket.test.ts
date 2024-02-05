import { bucketDeleteFile, bucketGetFile, bucketUploadFile } from "./bucket";

const env = getMiniflareBindings();

describe("Bucket instantiate and create methods", () => {
  test("instantiate method", async () => {
    const bucket = env.R2_BUCKET;
    expect(bucket).toBeDefined();
  });

  test("should upload file", async () => {
    const filename = "test";
    const data = Buffer.from("this is a test");
    const result = await bucketUploadFile(env, filename, data);
    expect(result).toBeDefined();
    expect(result.key).toEqual("test");
  });
});

describe("Bucket Read and Delete methods", () => {
  let filename, data;
  beforeAll(async () => {
    filename = "test";
    data = Buffer.from("this is a test");
    await bucketUploadFile(env, filename, data);
  });

  test("should delete file", async () => {
    const result = await bucketDeleteFile(env, filename);
    // expect(result).tobeca();
    // expect(result.key).toEqual("test");
  });

  test("should get file", async () => {
    const result = await bucketGetFile(env, filename);
    expect(result).toBeDefined();
    expect(result.key).toEqual(filename);
  });

  test("should return error because of wrong key", async () => {
    const result = await bucketGetFile(env, "wrongkey");
    expect(result).toBeNull();
  });
});
