var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
const { v4: uuidv4 } = require("uuid");
var dalService = require("../../../services/dal.service");
var fileService = require("../../../services/file.service");
const cheerio = require("cheerio");
const https = require("https");
const fs = require("fs");

module.exports = migrateMainService = {
  startup: async function (app) {
    if (app) {
      app.get("/migrate-lkjdfo7sdw", async function (req, res) {
        //   const backupFilePath = `${appRoot.path}${req.query.file}`;
        await migrateMainService.startMigration(req);
        // await backUpRestoreService.zipBackUpDirectory();
        // backUpRestoreService.uploadToDropBox();
        res.send(`ok`);
      });
    }
  },

  startMigration: async function () {
    console.log("starting migration");

    migrateMainService.scanFiles();
  },

  upsertRecord: async function (title, url, body, image, metaDescription) {
    let data = {
      published: true,
      title: title,
      url: url,
      notes: image,
      metaDescription: metaDescription,
      body: body,
      contentType: "blog",
      createdByUserId: uuidv4(),
    };
    let record = await dalService.contentUpdateByUrl("", data.url, data, {
      user: "",
    });
    console.log("created:", record);
  },

  scanFiles: async function () {
    let files = await fileService.getFilesSearchSync(
      "/Users/lanecampbell/Dev/famlu/wayback-scraper/websites/www.famlu.com/blog",
      "/**/*.html"
    );
    // console.log(files);

    files.map(async (file) => {
      let content = await fileService.getFile(file, false);
      const $ = cheerio.load(content);
      //blog-item-body
      let title = $("title").text().replace(" | Famlu Family Websites", "");
      let url = $("link[rel='canonical']")
        .attr("href")
        .replace("https://www.famlu.com", "");
      let body = $(".blog-item-body").html();
      let image = $(".field-name-field-images img").attr("src");
      let metaDescription = $("meta[name='description']").attr("content");

      await migrateMainService.upsertRecord(
        title,
        url,
        body,
        image,
        metaDescription
      );

      //   console.log(content.length, '==>', copy.length);
      console.log(title);
    });
  },

  // processImage: async function (url) {
  //   if (url) {
  //     //needs local temp path
  //     const file = fs.createWriteStream("./server/temp/file.jpg");
  //     const request = https.get(
  //       url,
  //       function (response) {
  //         response.pipe(file);
  //       }
  //     );
  //   }
  // },
};
