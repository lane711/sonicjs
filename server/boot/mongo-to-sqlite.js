const fs = require("fs");
const { parse, stringify } = require("envfile");
const path = require("path");
const Content = require("../schema/models/content");
var globalService = require("../services/global.service");

const mongoose = require("mongoose");

const typeorm = require("typeorm");
const { Like } = require("typeorm");

const { getRepository } = require("typeorm");
const { Post } = require("../data/model/Post");
const { Content } = require("../data/model/Content");

let idMapTable = [];

const mongoUrl =
  "mongodb+srv://sonicAdmin:Tiger66^@cluster0.1igz1.mongodb.net/sonicjs?retryWrites=true&w=majority";

mongoose.connect(mongoUrl, {
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
  typeorm.createConnection().then((connection) => {
    const contentRepo = connection.getRepository(Content);

    //clear all data
    connection
      .createQueryBuilder()
      .delete()
      .from(Content)
      .where("id > :id", { id: 0 })
      .execute();

    // return;

    let i = 0;
    data.forEach((contentData) => {
      // console.log(contentData.url);

      let content = new Content();
      content.data = JSON.stringify(contentData.data);
      content.contentTypeId = contentData.contentTypeId;
      content.createdByUserId = 1;
      content.lastUpdatedByUserId = 1;
      content.createdOn = contentData.createdOn;
      content.updatedOn = contentData.updatedOn;
      content.url = contentData.url;
      content.tags = [];

      contentRepo.save(content).then((newContent) => {
        idMapTable.push({ oldId: contentData.id, newId: newContent.id });
        i++;

        if (data.length === i) {
          updateIds();
        }
      });
    });
    return;
  });
}

async function updateIds() {
  console.log("===== updateIds =====");

  // typeorm.createConnection().then((connection) => {
  const contentRepo = getRepository(Content);

  for (let index = 0; index < idMapTable.length; index++) {
    const contentData = idMapTable[index];
    console.log("map-->", contentData);

    let contentToBeUpdated = await contentRepo.find({
      data: Like(`%${contentData.oldId}%`),
    });

    if (contentToBeUpdated.length > 0) {
      for (let index = 0; index < contentToBeUpdated.length; index++) {
        const content = contentToBeUpdated[index];
        let contentRecord = await contentRepo.findOne(
          { where:
              { id:  content.id}
          });
        console.log(contentRecord);
        contentRecord.lastUpdatedByUserId = 3;
        contentRecord.data = contentRecord.data.replace(contentData.oldId, contentData.newId);
        contentRepo.update(content.id, contentRecord);
      }
    }
  }

  // let content = new Content();
  // content.data = JSON.stringify(contentData.data);
  // content.contentTypeId = contentData.contentTypeId;
  // content.createdByUserId = 1
  // content.lastUpdatedByUserId = 1
  // content.createdOn = contentData.createdOn
  // content.updatedOn = contentData.updatedOn
  // content.url = contentData.url
  // content.tags = [];

  // contentRepo.save(content);

  // });
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
