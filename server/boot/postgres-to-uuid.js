const fs = require("fs");
const {parse, stringify} = require("envfile");
const path = require("path");
var globalService = require("../services/global.service");
var dalService = require("../services/dal.service");
const {Content} = require("../data/model/Content");

const typeorm = require("typeorm");
const {Like} = require("typeorm");
const {getRepository} = require("typeorm");
const {assertCompositeType} = require("graphql");
var contentRepo;

let idMapTable = [];

var axios = require("axios");
// const defaultOptions = {
//   headers: {},
//   baseURL: globalService.baseUrl,
// };
let axiosInstance = axios.create();
const session = {user: {id: "69413190-833b-4318-ae46-219d690260a9"}};

async function main() {
  console.log('starting...');
  let {data} = await getContentFromAPI();
  if (data.data.contents.length > 1) {
    console.log('content count ', data.data.contents.length);
    await dalService.contentDeleteAll(session);
    console.log('content deleted');
    await migrateContent(data.data.contents);
    console.log('migration complete');

    await updateIds();
  }
  let x;
}

async function test(){
  let id = 1;
  let contentToBeUpdated = await dalService.contentGetLike('\\\\"1\\\\"');

  console.log(contentToBeUpdated);
}

async function getContentFromAPI() {
  let apiUrl = "https://sonicjs.herokuapp.com/graphql";

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
  await Promise.all(data.map(async (contentData) => {
    // console.log(contentData.url);

    // let content = {};
    // content.data = JSON.stringify(contentData.data);
    // content.contentType = contentData.contentTypeId;
    // content.createdByUserId = "69413190-833b-4318-ae46-219d690260a9";
    // content.lastUpdatedByUserId = "69413190-833b-4318-ae46-219d690260a9";
    // content.createdOn = contentData.createdOn;
    // content.updatedOn = contentData.updatedOn;
    // content.url = contentData.url;

    let newContent = await dalService.contentUpdate(undefined, contentData.url, contentData.data, session);
    console.log('id', contentData.id, newContent.id);
    idMapTable.push({oldId: contentData.id, newId: newContent.id});
  }));
}



async function updateIds() {
  console.log("===== updateIds =====");


  for (let index = 0; index < idMapTable.length; index++) {
    const contentData = idMapTable[index];
    console.log("map-->", contentData);

    //this is for smart tags
    let contentToBeUpdated = await dalService.contentGetLike(`\\\\"${contentData.oldId}\\\\"`);
    await updateIdsRecords(contentToBeUpdated, contentData);

    //this is for section layouts
    let contentToBeUpdated2 = await dalService.contentGetLike(`\"${contentData.oldId}\"`);
    await updateIdsRecords(contentToBeUpdated2, contentData);

  }
}

async function updateIdsRecords(contentToBeUpdated, contentData) {
  if (contentToBeUpdated.length > 0) {
    console.log(contentToBeUpdated.length + ' updates to be made');
    for (let index = 0; index < contentToBeUpdated.length; index++) {
      const content = contentToBeUpdated[index];
      let contentRecord = await contentRepo.findOne({
        where: {id: content.id},
      });
      console.log(contentRecord);
      contentRecord.lastUpdatedByUserId = 3;
      contentRecord.data = contentRecord.data.replace(
        `"${contentData.oldId}`,
        `"${contentData.newId}`
      );

      contentRecord.data = JSON.parse(contentRecord.data);
      if(contentRecord.contentTypeId == 'section'){
        console.log('section', contentRecord.data)
      }
      // await contentRepo.update(content.id, contentRecord);
      let updateContent = await dalService.contentUpdate(contentRecord.id, contentRecord.url, contentRecord.data, session);

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
    logging: "error",
    ssl: false,
  };

  typeorm.createConnection(connectionSettings).then((connection) => {
    contentRepo = getRepository(Content);
    // console.log(logSymbols.success, "Successfully connected to Database!");
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

