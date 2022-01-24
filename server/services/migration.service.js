const https = require("https");
fs = require("fs");
var unzipper = require("unzipper");
var appRoot = require("app-root-path");
var dalService = require("./dal.service");
var dataService = require("./data.service");
var fileService = require("./file.service");
const archiver = require("archiver");
const {getRepository, Like} = require("typeorm");
const {Content} = require("../data/model/Content");
const globalService = require("./global.service");
const axios = require("axios");
const _ = require("underscore")
const token = process.env.DROPBOX_TOKEN;
const migrateUrl = process.env.MIGRATE_URL;
const session = {user: {id: "69413190-833b-4318-ae46-219d690260a9"}};
var idMapTable = [];

module.exports = migrationService = {
  startup: async function (app) {
    if (migrateUrl) {
      app.get(migrateUrl, async function (req, res) {
        let data = await migrationService.getContentFromAPI();
        await migrationService.migrateContent(data.data.data.contents)
        // await migrationService.migrateContent(data);
        // await backUpRestoreService.zipBackUpDirectory();
        // backUpRestoreService.uploadToDropBox();
        res.send(200);
      });
    }
  },


  getContentFromAPI: async function () {
    let apiUrl = "https://sonicjs.com/graphql";
    let ax = await migrationService.getAxios();
    return await ax.post(apiUrl, {
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
  },

  migrateContent: async function (data) {

    await dalService.contentDeleteAll(session);

    let i = 0;

    await Promise.all(
      data.map(async (contentData) => {
        // console.log(contentData.url);

        let content = {};
        content.data = contentData.data;
        content.contentTypeId = contentData.contentTypeId;
        content.createdByUserId = "69413190-833b-4318-ae46-219d690260a9";
        content.lastUpdatedByUserId = "69413190-833b-4318-ae46-219d690260a9";
        content.createdOn = contentData.createdOn;
        content.updatedOn = contentData.updatedOn;
        content.url = contentData.url;
        content.tags = [];

        let newContent = await dalService.contentUpdate(undefined, content.url, content.data, session, true);
        idMapTable.push({oldId: contentData.id, newId: newContent.id});

      })
    );

    await migrationService.updateIds();

  },

  updateIds: async function () {
    console.log("===== updateIds =====");

    // typeorm.createConnection().then((connection) => {
    // const contentRepo = getRepository(Content);

    idMapTable = _.sortBy(idMapTable, 'oldId');

    for (let index = 0; index < idMapTable.length; index++) {
      const contentData = idMapTable[index];

      console.log("map-->", contentData);

      //handle with front slash then quote refs
      let contentToBeUpdated = await dalService.contentGet("", "", "", "", "", "", undefined, false,
        true, `%\\\\"${contentData.oldId}\\\\"%`);
      migrationService.updateWithNewId(contentToBeUpdated, contentData);

      //handle with simple quotes
      let contentToBeUpdated2 = await dalService.contentGet("", "", "", "", "", "", undefined, false,
        true, `%"${contentData.oldId}"%`);
      migrationService.updateWithNewId(contentToBeUpdated2, contentData);


    }
  },

  updateWithNewId: async function (contentToBeUpdated, contentData) {
    if (contentToBeUpdated.length > 0) {
      for (let index = 0; index < contentToBeUpdated.length; index++) {
        const content = contentToBeUpdated[index];
        console.log("replacing-->", content.id);
        let contentRecord = await dalService.contentGet(content.id, "", "", "", "", "", undefined, false,
          true, undefined);

        //   await contentRepo.findOne({
        //   where: {id: content.id},
        // });
        console.log(contentRecord);
        // contentRecord.lastUpdatedByUserId = 3;
        contentRecord.data = JSON.stringify(contentRecord.data);
        contentRecord.data = contentRecord.data.replace(
          contentData.oldId,
          contentData.newId
        );
        let data = JSON.parse(contentRecord.data);
        await dalService.contentUpdate(content.id, content.url, data, session, true);

      }
    }
  },

  getAxios: async function () {

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      baseURL: globalService.baseUrl,
      cookie:
        "sonicjs=s%3AMmvj7HC35YSG-RP1WEY6G3NS7mrSRFcN.EoldLokzB5IMX34xGLC2QwbU0HZn2dSFmtQ9BhPB26w",
    };

    // let token = helperService.getCookie("sonicjs_access_token");
    // if (token) {
    //   defaultOptions.headers.Authorization = token;
    // }

    var axiosInstance = axios.create(defaultOptions);
    axiosInstance.defaults.withCredentials = true;

    return axiosInstance;
  }

  // processJsonFiles: async function (req) {


};
