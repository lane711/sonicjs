const fs = require("fs");
const { parse, stringify } = require("envfile");
const path = require("path");
const Content = require("../schema/models/content");

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/sonicjs", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("conneted to database");

  console.log("Info: running seed-data.js to seed database.");

  let dataRaw = fs.readFileSync("server/data/data.json");
  let data = JSON.parse(dataRaw);

  // console.log(data);
  // migrateContentTypes(app);
  migrateContent(data);
});

async function migrateContent(data) {
  let contentObjs = data.models.content;

  var contents = Object.keys(contentObjs).map((key) => [
    Number(key),
    contentObjs[key],
  ]);

  contents.forEach((contentData) => {
    console.log(contentData);
    let objString = contentData[1];
    let obj = JSON.parse(objString);

    let newContent = {
      data: obj.data,
    };

    console.log(newContent);

    let url = newContent.data.url ?? slugify(newContent.data.title) ?? slugify(newContent.data.contentType);
    console.log("url -->", url);

    //insert to db
    let content = new Content({
      contentTypeId: newContent.data.contentType,
      data: newContent.data,
      createdByUserId: -1,
      lastUpdatedByUserId: -1,
      url: url,
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    delete content.data.contentType;

    try {
      content.save();
    } catch (error) {
      console.log(err);
    }

    // app.models.content.create(newContent, function (err, newInstance) {
    //   if (err) throw err;
    //   console.log("Content created:", newInstance);
    //   setEnvVarToEnsureMigrationDoesNotRunAgain();
    //   console.log("Success! Initial data migration complete.");
    // });
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

  return '/' + slug;
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
