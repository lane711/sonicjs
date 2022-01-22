const fs = require("fs");
const { parse, stringify } = require("envfile");
const path = require("path");
var globalService = require("../services/global.service");
var dalService = require("../services/dal.service");
const { Content } = require("../data/model/Content");

const typeorm = require("typeorm");
const { Like } = require("typeorm");
const { getRepository } = require("typeorm");
const { assertCompositeType } = require("graphql");
let idMapTable = [];

var axios = require("axios");
// const defaultOptions = {
//   headers: {},
//   baseURL: globalService.baseUrl,
// };
let axiosInstance = axios.create();
const  session = { user: { id: "69413190-833b-4318-ae46-219d690260a9" } };

async function main() {
  let data = await getContentFromAPI();
  await dalService.contentDeleteAll(session);
  migrateContent(data.data.data.contents);
  let x;
}

async function getContentFromAPI() {
  let apiUrl = "https://sonicjs.com/graphql";

  return await getAxios().post(apiUrl, {
    query: `
    {
      contents (sessionID:"bypass")
      {
        id
        contentTypeId
        data
        url
        createdOn
        updatedOn
      }
    }
      `,
  });
}

async function migrateContent(data) {

    let i = 0;
    data.forEach((contentData) => {
      // console.log(contentData.url);

      let content = {};
      content.data = JSON.stringify(contentData.data);
      content.contentTypeId = contentData.contentTypeId;
      content.createdByUserId = "69413190-833b-4318-ae46-219d690260a9";
      content.lastUpdatedByUserId = "69413190-833b-4318-ae46-219d690260a9";
      content.createdOn = contentData.createdOn;
      content.updatedOn = contentData.updatedOn;
      content.url = contentData.url;
      content.tags = [];

      dalService.contentUpdate(undefined, content.url, content, session).then((newContent) => {
        idMapTable.push({ oldId: contentData.id, newId: newContent.id });
        i++;

        if (data.length === i) {
          updateIds();
        }
      });
    });
    return;

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
        let contentRecord = await contentRepo.findOne({
          where: { id: content.id },
        });
        console.log(contentRecord);
        contentRecord.lastUpdatedByUserId = 3;
        contentRecord.data = contentRecord.data.replace(
          contentData.oldId,
          contentData.newId
        );
        contentRepo.update(content.id, contentRecord);
      }
    }
  }
}
  function getAxios() {
    //TODO add auth
    // debugger;
    if (!axiosInstance) {
      // if (true) {

      const defaultOptions = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        baseURL: globalService.baseUrl,
        cookie:
          "sonicjs=s%3AMmvj7HC35YSG-RP1WEY6G3NS7mrSRFcN.EoldLokzB5IMX34xGLC2QwbU0HZn2dSFmtQ9BhPB26w",
      };

      let token = helperService.getCookie("sonicjs_access_token");
      if (token) {
        defaultOptions.headers.Authorization = token;
      }

      axiosInstance = axios.create(defaultOptions);
      axiosInstance.defaults.withCredentials = true;
    }
    // debugger;
    return axiosInstance;
  }


  async function setupConnection() {

    let connectionSettings = {
      url: "postgres://postgres:postgres@localhost:5432/sjs",
      type: "postgres",
      entities: ["server/data/entity/*.js"],
      synchronize: false,
      logging:"error",
      ssl: false,
    };

    typeorm.createConnection(connectionSettings).then((connection) => {
      console.log(logSymbols.success, "Successfully connected to Database!");
      main();
    });
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
// }

// function slugify(text) {
//   // console.log('slug', text);
//   if (!text) {
//     return undefined;
//   }

//   let slug = text
//     .toLowerCase()
//     .replace(/[^\w ]+/g, "")
//     .replace(/ +/g, "-");

//   return "/" + slug;
// }

// async function setEnvVarToEnsureMigrationDoesNotRunAgain() {
//   let sourcePath = path.join(__dirname, "../..", ".env");

//   fs.readFile(sourcePath, "utf8", function (err, data) {
//     if (err) {
//       return console.log(err);
//     }
//     let parsedFile = parse(data);
//     parsedFile.RUN_NEW_SITE_MIGRATION = "FALSE";
//     fs.writeFileSync(sourcePath, stringify(parsedFile));
//   });
// }
// };

setupConnection();

