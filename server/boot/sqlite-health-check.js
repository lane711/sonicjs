const typeorm = require("typeorm");
const { Content } = require("../data/model/Content");

typeorm.createConnection().then(async (connection) => {
  const contentRepo = connection.getRepository(Content);
  let contents = await contentRepo.find();
  console.log(`Success, content doc count: ${contents.length}`);
});