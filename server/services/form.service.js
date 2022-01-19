isBackEndMode = false;
var axiosInstance;

if (typeof module !== "undefined" && module.exports) {
  isBackEndMode = true;
  var dataService = require("./data.service");
  var emitterService = require("./emitter.service");
  var helperService = require("./helper.service");
  var globalService = require("./global.service");
  var multipart = require("connect-multiparty");
  var _ = require("underscore");
  var appRoot = require("app-root-path");

  var fs = require("fs");
  var axios = require("axios");

  const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
  const chalk = require("chalk");
  const log = console.log;

  const Formio = {};
  const document = { getElementById: {} };
} else {
}

(function (exports) {
  (exports.startup = async function (app) {
    emitterService.on("requestBegin", async function (options) {
      // console.log('data service startup')
      if (options) {
        const defaultOptions = {
          headers: {},
          baseURL: globalService.baseUrl,
        };

        if (
          options.req.signedCookies &&
          options.req.signedCookies.sonicjs_access_token
        ) {
          defaultOptions.headers.Authorization =
            options.req.signedCookies.sonicjs_access_token;
        }

        axiosInstance = axios.create(defaultOptions);
      }
    });

    emitterService.on("getRenderedPagePostDataFetch", async function (options) {
      if (options && options.page) {
        options.page.data.editForm = await exports.getForm(
          options.page.contentTypeId,
          null,
          "submitContent(submission)",
          undefined,
          undefined,
          options.req.sessionID
        );
      }
    });

    app.get("/form", async function (req, res) {
      res.send("form ok");
    });

    var multipart = require("connect-multiparty");

    app.use(
      multipart({
        uploadDir: `${appRoot.path}/server/temp`,
      })
    );

    app.post("/video-upload", async function (req, res, next) {
      let filePath = req.files.file.path;

      res.cookie("videoPath", filePath, { maxAge: 900000, httpOnly: true });

      res.send(filePath);
      // next();
    });
  }),
    (exports.getForm = async function (
      contentTypeId,
      content,
      onFormSubmitFunction,
      returnModuleSettings = false,
      formSettingsId,
      sessionID
    ) {
      let contentType;
      // debugger;
      if (content && content.data.contentType) {
        contentType = await dataService.contentTypeGet(
          content.data.contentType.toLowerCase(),
          sessionID
        );
      } else if (contentTypeId) {
        contentType = await dataService.contentTypeGet(
          contentTypeId,
          sessionID
        );

        //add a hidden object for the formsettings id so we can look it up on form submission
        if (formSettingsId) {
          contentType.data.components.unshift({
            type: "textfield",
            inputType: "text",
            key: "formSettingsId",
            defaultValue: formSettingsId,
            hidden: false,
            input: true,
            customClass: "hide",
          });
        }

        if (returnModuleSettings) {
          const settingContentType = await dataService.contentTypeGet(
            `${contentTypeId}-settings`,
            sessionID
          );
          // debugger;
          if (settingContentType && settingContentType.data) {
            contentType = settingContentType;
          }
        }
      } else {
        return;
      }


      if (!onFormSubmitFunction) {
        onFormSubmitFunction = "editInstance(submission,true)";
      }


      const formJSON = await exports.getFormJson(contentType, content);

      let form = "";

      let data = { viewModel: {}, viewPath: "/server/assets/html/form.html" };
      data.viewModel.onFormSubmitFunction = onFormSubmitFunction;
      data.viewModel.formJSON = JSON.stringify(formJSON);
      let formValuesToLoad = content && content.data ? content.data : {};
      data.viewModel.formValuesToLoad = JSON.stringify(formValuesToLoad);
      data.viewModel.random = helperService.generateRandomString(8);
      data.viewPath = "/server/assets/html/form.html";
      data.contentType = "";

      // let formHtml = await axiosInstance.post(`/api/views/getProceedView`, {
      //   data: data,
      // });

      // debugger;
      let formHtml = await dataService.getView(
        "",
        data.viewModel,
        data.viewPath
      );

      if (formHtml) {
        form += formHtml;
      } else {
        let template = await this.getFormTemplate();
        form += template;
      }

      return form;
    }),
    (exports.getFormJson = async function (contentType, content) {
      let name = `${contentType.systemId}Form`;
      let settings = await this.getFormSettings(contentType, content);
      let components = await this.getFormComponents(contentType, content);
      const formJSON = {
        components: components,
        name: name,
        settings: settings,
      };

      return formJSON;
    }),
    (exports.getTemplate = async function () {
      let template = await this.getFormTemplate();
    }),
    (exports.getFormTemplate = async function () {
      if (isBackEndMode) {
        return this.getFormTemplateFileSystem();
      } else {
        let template = await globalService.axiosInstance.get("/html/form.html");
        return template.data;
      }
    }),
    (exports.getFormTemplateFileSystem = async function () {
      return new Promise((resolve, reject) => {
        let themeFilePath = "/server/assets/html/form.html";
        fs.readFile(themeFilePath, "utf8", (err, data) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }),
    (exports.getFormSettings = async function (contentType, content) {
      let settings = {};
      if (isBackEndMode) {
        settings.recaptcha = {
          isEnabled: "true",
          siteKey: process.env.RECAPTCHA_SITE_KEY,
        };
      }
      return settings;
    }),
    (exports.getFormComponents = async function (contentType, content) {

      let components = contentType.data?.components;

      if (content) {
        this.addBaseContentTypeFields(
          content.id,
          content.data.contentType,
          components
        );
      } else if (components) {
        components.push({
          type: "hidden",
          key: "contentType",
          label: "contentType",
          defaultValue: contentType.systemId,
          hidden: false,
          input: true,
        });
      }

      return components;
    }),
    (exports.addBaseContentTypeFields = function (id, contentType, controls) {
      // console.log("addBaseContentTypeFields", contentType, controls);

      if (controls) {
        controls.push({
          type: "textfield",
          key: "id",
          label: "id",
          customClass: "hide",
          defaultValue: id,
          hidden: false,
          input: true,
        });
      }

    });

  exports.setFormApiUrls = async function (Formio) {
    Formio.setProjectUrl(sharedService.getBaseUrl() + "/nested-forms-list");
    Formio.setBaseUrl(sharedService.getBaseUrl() + "/nested-forms-get");
  };
  // }
})(typeof exports === "undefined" ? (this["formService"] = {}) : exports);
