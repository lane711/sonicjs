var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var jimp = require("jimp");
var path = require("path");
const fs = require("fs");

module.exports = imageProcessingMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "IMAGE-PROCESSING") {
        options.moduleName = "image-processing";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("requestBegin", async function (options) {
      if (options.req.url.startsWith("/images/")) {
        let filePath = decodeURIComponent(options.req.path);

        if (!isSupportedImageType(filePath)) {
          return;
        }

        options.req.isRequestAlreadyHandled = true;

        // Read the image.
        let fileName = filePath.replace("/images/", "");
        let width =
          options.req.query.width === "0" ? undefined : options.req.query.width;
        let height =
          options.req.query.height === "0"
            ? undefined
            : options.req.query.height;

        if (!width && !height) {
          //send original image
          //should redirect
          options.res.redirect(`/api/containers/files/download/${fileName}`);
          return;
        }

        let imagePath = path.join(
          __dirname,
          "../../..",
          `/storage/files/${fileName}`
        );
        let newImagePath = `/server/storage/files/width-${width}/${fileName}`;

        let widthBasedResize = true;
        if (!width && height) {
          newImagePath = `/server/storage/files/height-${height}/${fileName}`;
          widthBasedResize = false;
        }

        if (!width && !height) {
          let originalImagePath = `/server/storage/files/${fileName}`;
          options.res.sendFile(originalImagePath, { root: "./" });
        }

        try {
          if (!fs.existsSync(newImagePath)) {
            //file does not exist
            console.log(
              `creating ${fileName} with width: ${width}, height: ${height} at: ${newImagePath}`
            );
            const image = await jimp.read(imagePath);
            image.quality(100);
            if (widthBasedResize) {
              await image.resize(parseInt(width), jimp.AUTO);
            } else {
              await image.resize(jimp.AUTO, parseInt(height));
            }
            let img = await image.writeAsync(newImagePath);
          }
        } catch (err) {
          console.error(err);
        }

        options.res.sendFile(newImagePath, { root: "./" });
      }
    });

    function isSupportedImageType(filePath) {
      let extension = filePath.split(".").pop();
      var supportedImageTypes = ["jpg", "jpeg", "png", "gif", "bmp"];
      var isSupportedImageType = supportedImageTypes.includes(extension, 0);
      return isSupportedImageType;
    }
  },
};
