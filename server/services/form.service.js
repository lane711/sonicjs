isBackEndMode = false;
var axiosInstance;

if (typeof module !== "undefined" && module.exports) {
  isBackEndMode = true;
  var dataService = require("./data.service");
  var eventBusService = require("./event-bus.service");
  var helperService = require("./helper.service");
  var globalService = require("./global.service");

  var fs = require("fs");
  const cheerio = require("cheerio");
  var axios = require("axios");

  const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
  const chalk = require("chalk");
  const log = console.log;

  const Formio = {};
  const document = { getElementById: {} };
} else {
}

(function (exports) {
  (exports.startup = async function () {
    eventBusService.on("requestBegin", async function (options) {
      // console.log('data service startup')
      if (options) {
        const defaultOptions = {
          headers: {},
          baseURL: globalService.baseUrl,
        };

        if (options.req.signedCookies.sonicjs_access_token) {
          defaultOptions.headers.Authorization =
            options.req.signedCookies.sonicjs_access_token;
        }

        axiosInstance = axios.create(defaultOptions);

        // axiosInstance = axios.create({ baseURL: globalService.baseUrl });
      }
    });

    eventBusService.on("getRenderedPagePostDataFetch", async function (
      options
    ) {
      if (options && options.page) {
        options.page.data.editForm = await exports.getForm(
          options.page.contentTypeId,
          null,
          "submitContent(submission)"
        );
      }
    });
  }),
    (exports.getForm = async function (
      contentTypeId,
      content,
      onFormSubmitFunction
    ) {
      // const viewModel = encodeURI(`{"data": {"onFormSubmitFunction":"addModuletoColumn(submission)"}}`);
      // const viewPath = encodeURI(`/assets/html/form.html`);
      // let formHtml = await axiosInstance.get(`api/views/getProceedView?viewModel=${viewModel}&viewPath=${viewPath}`)

      // debugger;
      let contentType;
      if (content && content.data.contentType) {
        contentType = await dataService.getContentType(
          content.data.contentType
        );
      } else if (contentTypeId) {
        contentType = await dataService.getContentType(contentTypeId);
      } else {
        return;
      }

      if (!onFormSubmitFunction) {
        onFormSubmitFunction = "editContentInstance(submission,true)";
      }

      // let name = `${contentType.systemid}Form`;
      // let settings = await this.getFormSettings(contentType, content);
      // let components = await this.getFormComponents(contentType, content);
      // const formJSON = {
      //   components: components,
      //   name: name,
      //   settings: settings
      // };
      // debugger;
      const formJSON = await exports.getFormJson(contentType, content);

      let form = "";
      // let form = "<script type='text/javascript'> const formJSON = ";
      // form += JSON.stringify(formJSON);
      // form += "</script>";

      // form += "<script type='text/javascript'> const formValuesToLoad = ";
      // if (content) {
      //     form += JSON.stringify(content.data);
      // }
      // else {
      //     form += "{}";
      // }
      // form += "</script>";

      // debugger;
      let data = { viewModel: {}, viewPath: "/assets/html/form.html" };
      data.viewModel.onFormSubmitFunction = onFormSubmitFunction;
      data.viewModel.formJSON = formJSON;
      data.viewModel.formValuesToLoad =
        content && content.data ? content.data : {};
      data.viewModel.random = helperService.generateRandomString(8);
      data.viewPath = "/assets/html/form.html";
      data.contentType = "";
      // let strViewModelData = JSON.stringify(viewModelData);
      // const viewModel = encodeURI(strViewModelData);
      // const viewPath = encodeURI(`/assets/html/form.html`);
      // let formHtml = await axiosInstance.post(`/api/views/getProceedView?viewModel=${viewModel}&viewPath=${viewPath}`)
      let formHtml = await axiosInstance.post(`/api/views/getProceedView`, {
        data: data,
      });

      if (formHtml) {
        form += formHtml.data.data;
      } else {
        let template = await this.getFormTemplate();
        form += template;
      }

      return form;
    }),
    (exports.getFormJson = async function (contentType, content) {
      let name = `${contentType.systemid}Form`;
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
        let themeFilePath = __dirname + "/../assets/html/form.html";
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
      // let contentTypeDef = await dataService.getContentType(content.data.contentType);
      // console.log('contentTypeDef', contentTypeDef);
      // debugger;
      let components = contentType.data.components;

      if (content) {
        this.addBaseContentTypeFields(
          content.id,
          content.data.contentType,
          components
        );
      } else if (components) {
        components.push({
          type: "textfield",
          key: "contentType",
          label: "contentType",
          defaultValue: contentType.systemid,
          hidden: true,
          input: true,
        });
      }

      return components;
    }),
    (exports.addBaseContentTypeFields = function (id, contentType, controls) {
      // console.log('addBaseContentTypeFields', contentType, controls);

      controls.push({
        type: "textfield",
        key: "id",
        label: "id",
        defaultValue: id,
        hidden: true,
        input: true,
      });

      //   controls.push({
      //     type: 'textfield',
      //     key: 'contentTypeId',
      //     label: 'contentTypeId',
      //     defaultValue: contentType,
      //     input: true
      //   });

      // if(isToBePopulatedWithExistingContent){
      //   let controlId = new HiddenQuestion({
      //     key: 'id',
      //     label: 'Id',
      //     value: contentType.id,
      //     required: true,
      //     order: 0
      //   });
      //   controls.push(controlId);

      //   let controlContentType = new HiddenQuestion({
      //     key: 'contentTypeId',
      //     label: 'Content Type',
      //     value: contentType.systemid,
      //     required: true,
      //     order: 1
      //   });
      //   controls.push(controlContentType);
      // }
    });

  exports.setFormApiUrls = async function (Formio) {
    Formio.setProjectUrl(sharedService.getBaseUrl() + "/nested-forms-list");
    Formio.setBaseUrl(sharedService.getBaseUrl() + "/nested-forms-get");
  };
  // }
})(typeof exports === "undefined" ? (this["formService"] = {}) : exports);
