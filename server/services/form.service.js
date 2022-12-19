/**
 * Form Service -
 * The form service is responsible for generating the data entry forms that are used both on the front end and back end aministratice sections. 
 * SonicJs uses form.io, an open source form generator.
 * @module formService
 */
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
          options.req,
          options.req.url
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
      req,
      referringUrl,
      showBuilder = false
    ) {
      req.referringUrl = referringUrl;
      let contentObject = content;
      if ((typeof content === 'string' || content instanceof String) && content.length){
        contentObject = JSON.parse(content)
      } 
      let contentType;
      // debugger;
      if (contentObject && contentObject.data.contentType) {
        contentType = await dataService.contentTypeGet(
          contentObject.data.contentType.toLowerCase(),
          req
        );
      } else if (contentTypeId) {
        contentType = await dataService.contentTypeGet(
          contentTypeId,
          req
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
            req
          );
          // debugger;
          if (settingContentType && settingContentType.title && settingContentType.data) {
            contentType = settingContentType;
          }
        }
      } else {
        return;
      }

      if (contentType && emitterService) {
        await emitterService.emit("formComponentsLoaded", {
          contentType,
          contentObject,
          req
        });
      }

      if (!onFormSubmitFunction) {
        onFormSubmitFunction = "editInstance(submission,true)";
      }

      const formJSON = await exports.getFormJson(contentType, contentObject, showBuilder);

      let form = "";

      let data = { viewModel: {}, viewPath: "/server/assets/html/form.html" };
      data.viewModel.onFormSubmitFunction = onFormSubmitFunction;
      data.viewModel.editMode = false;
      let formValuesToLoad = {};
      if (contentObject && contentObject.data) {
        formValuesToLoad = contentObject.data;
        data.viewModel.editMode = true;
      }

      //override button copy
      if (contentType.data.states) {
        if (data.viewModel.editMode && contentType.data.states.editSubmitButtonText) {
          const submitButton = contentType.data.components.find(
            (c) => c.key === "submit"
          );
          if (submitButton) {
            submitButton.label = contentType.data.states.editSubmitButtonText;
          }
        }

        if (!data.viewModel.editMode && contentType.data.states.addSubmitButtonText) {
          const submitButton = contentType.data.components.find(
            (c) => c.key === "submit"
          );
          if (submitButton) {
            submitButton.label = contentType.data.states.addSubmitButtonText;
          }
        }
      }

      data.viewModel.formJSON = JSON.stringify(formJSON);

      data.viewModel.formValuesToLoad = JSON.stringify(formValuesToLoad);
      data.viewModel.random = helperService.generateRandomString(8);
      data.viewModel.formioFunction = showBuilder ? 'builder' : 'createForm';
      data.viewPath = "/server/assets/html/form.html";
      data.contentType = "";

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

      return {html: form, contentType };
    }),
    (exports.getFormJson = async function (contentType, content, showBuilder) {
      let name = `${contentType.systemId}Form`;
      let settings = await this.getFormSettings(contentType, content);
      let components = await this.getFormComponents(contentType, content, showBuilder);
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
    (exports.getFormComponents = async function (contentType, content, showBuilder) {
      let components = contentType.data?.components;

      if (content) {
        this.addBaseContentTypeFields(
          content.id,
          content.data.contentType,
          components
        );
      } else if (components && !showBuilder) {
        //only need this when creating new instances
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
    let baseUrl = sharedService.getBaseUrl();
    Formio.setProjectUrl(baseUrl);
    Formio.setBaseUrl(baseUrl);
  };
  // }
})(typeof exports === "undefined" ? (this["formService"] = {}) : exports);
