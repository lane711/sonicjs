const fs = require("fs");
const { parse, stringify } = require("envfile");
const path = require("path");
const Content = require("../schema/models/content");

const mongoose = require("mongoose");

const { getRepository } = require("typeorm");
const { Post } = require("../data/model/Post");
const {  ContentORM } = require("../data/model/ContentORM");

mongoose.connect("mongodb://localhost:27017/sonicjs", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
  console.log("conneted to database");

  console.log("Info: migrating mongo data to sql lite");

  // let dataRaw = fs.readFileSync("server/data/data.json");
  // let data = JSON.parse(dataRaw);

  const data = await Content.find();

  // console.log(data);
  // migrateContentTypes(app);
  migrateContent(data);
});

async function migrateContent(data) {

  const contentRepo = await getRepository(ContentORM);


  data.forEach((contentData) => {
    console.log(contentData.url);


    // let content = new ContentORM();
    // content.data = JSON.stringify(contentData.data);
    // content.contentTypeId = contentData.contentTypeId;
    // content.createdByUserId = contentData.createdByUserId
    // content.lastUpdatedByUserId = contentData.lastUpdatedByUserId
    // content.createdOn = contentData.createdOn
    // content.updatedOn = contentData.updatedOn
    // content.url = contentData.url
    // content.tags = [];
  
    // contentRepo.save(content);

  });
}

function slugify(text) {
  // console.log('slug', text);
  if (!text) {
    return undefined;
  }

  let slug = text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");

  return "/" + slug;
}

async function setEnvVarToEnsureMigrationDoesNotRunAgain() {
  let sourcePath = path.join(__dirname, "../..", ".env");

  fs.readFile(sourcePath, "utf8", function (err, data) {
    if (err) {
      return console.log(err);
    }
    let parsedFile = parse(data);
    parsedFile.RUN_NEW_SITE_MIGRATION = "FALSE";
    fs.writeFileSync(sourcePath, stringify(parsedFile));
  });
}
// };
