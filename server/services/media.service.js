var dataService = require("./data.service");
var helperService = require("./helper.service");
var emitterService = require("./emitter.service");
var globalService = require("./global.service");

var fs = require("fs");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const fileService = require("./file.service");
const dalService = require("./dal.service");
const s3Service = require("./s3.service");
var _ = require("underscore");

const log = console.log;
var axiosInstance;

module.exports = mediaService = {
  startup: async function () {
    // emitterService.on("getRenderedPagePostDataFetch", async function (options) {
    //   if (options && options.page) {
    //     await mediaService.processHeroImage(options.page);
    //   }
    // });

    emitterService.on("requestBegin", async function (options) {
      // console.log('data service startup')
      if (options) {
        let baseUrl = globalService.baseUrl;
        // console.log('data service ' + baseUrl)
        axiosInstance = axios.create({ baseURL: baseUrl });
      }
    });
  },

  processHeroImage: async function (page) {
    // if (page.data.heroImage[0]) {
    //     page.data.heroImage = page.data.heroImage[0].originalName;
    // }

    let jumbotronStyle = "background:pink;";
    page.data.jumbotronStyle = jumbotronStyle;
  },

  getMedia: async function (sessionID) {
    let mediaRecords =
      (await dataService.getContentByType("media", sessionID)) || [];

    for (let index = 0; index < mediaRecords.length; index++) {
      const file = mediaRecords[index];
      file.data.src = await mediaService.getMediaUrl(file.data.file);
    }

    let storageOption = process.env.FILE_STORAGE;
    if (storageOption !== "AMAZON_S3") {
      let mediaFilesList = fileService.getFilesSync("/server/assets/uploads");

      if (mediaRecords.length !== mediaFilesList.length) {
        for (let index = 0; index < mediaFilesList.length; index++) {
          const fileName = mediaFilesList[index];
          if (fileName !== ".DS_Store") {
            let mediaRecord = mediaRecords.filter(
              (x) => x.data.file === fileName
            )[0];
            if (!mediaRecord) {
              //create the media record - the user has uploaded files
              let title = fileName.replace(/\.[^/.]+$/, "");
              let payload = {
                data: {
                  title: title,
                  file: fileName,
                  contentType: "media",
                  src: await mediaService.getMediaUrl(fileName),
                },
              };
              // debugger;
              mediaRecord = await dataService.contentCreate(
                payload,
                true,
                sessionID
              );
              // mediaRecords.push(mediaRecord);
            }
          }
        }
        //re-get list
        mediaRecords = await dataService.getContentByType("media", sessionID);
      }
    }

    let sortedMediaRecords = _.sortBy(mediaRecords, (i) =>
      i.data.title.toLowerCase()
    );
    return sortedMediaRecords;
  },

  mediaDelete: async function (id, sessionID) {
    let media = await dataService.getContentById(id, sessionID);
    dalService.contentDelete(media.id, sessionID);
    //delete from s3
    s3Service.delete(media.data.file);
  },

  getMediaUrl: function (fileName) {
    if (process.env.FILE_STORAGE === "AMAZON_S3") {
      // return 'https://sonicjscom.s3.us-west-1.amazonaws.com/main-shape.svg';
      return `https://${process.env.AMAZON_S3_BUCKETNAME}.s3.${process.env.AMAZON_S3_REGION}.amazonaws.com/${fileName}`;
      // https://sonicjscom.s3.us-west-1.amazonaws.com/main-shape.svg
    } else {
      return `/assets/uploads/${fileName}`;
    }
  },

  addMediaUrl: async function (mediaList) {
    mediaList.forEach((media) => {
      media.data.url = `/api/containers/files/download/${media.data.file}`;
      media.data.thumbUrl = `/images/${media.data.file}?width=240`;
    });
  },
};
