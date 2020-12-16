//check if running in node (and not the browser)
if (typeof module !== "undefined" && module.exports) {
  // var loopback = require("loopback");
  var emitterService = require("./emitter.service");
  var globalService = require("./global.service");
  var pageBuilderService = require("./page-builder.service");
  var formService = require("./form.service");
  var helperService = require("./helper.service");
  var formattingService = require("./formatting.service");

  var axios = require("axios");
  var fs = require("fs");
  var ShortcodeTree = require("shortcode-tree").ShortcodeTree;
  var chalk = require("chalk");
  // const { request, gql } = require("graphql-request");
  var { GraphQLClient, gql, request } = require("graphql-request");

  var log = console.log;
} else {
  // var globalService = {};
  // const { request, gql } = require("graphql-request");
}

(function (exports) {
  var apiUrl = "/api/";
  var pageContent = "";
  var page;
  var id;
  var axiosInstance;

  (exports.startup = async function () {
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

        // axiosInstance = axios.create({ baseURL: globalService.baseUrl });
      }
    });
  }),
    (exports.executeGraphqlQuery = async function (query) {
      const endpoint = `${globalService.baseUrl}/graphql`;

      const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
          authorization: "Bearer MY_TOKEN",
        },
      });

      const data = graphQLClient.request(query);
      return data;
    }),
    (exports.getAxios = function () {
      //TODO add auth
      if (!axiosInstance) {
        const defaultOptions = {
          headers: {},
          baseURL: globalService.baseUrl,
        };

        let token = helperService.getCookie("sonicjs_access_token");
        if (token) {
          defaultOptions.headers.Authorization = token;
        }

        axiosInstance = axios.create(defaultOptions);

        // axiosInstance = axios.create({ baseURL: globalService.baseUrl });
      }
      return axiosInstance;
    }),
    (exports.getContent = async function () {
      //HACK removing sort bc LB not working with RDMS
      const filter = ""; //encodeURI(`{"order":"data.createdOn DESC"}`);

      let url = `${apiUrl}content?filter=${filter}`;
      let page = await this.getAxios().get(url);
      await formattingService.formatDates(page.data);
      await formattingService.formatTitles(page.data);
      return page.data;
    }),
    (exports.getContentAdmin = async function () {
      //HACK removing sort bc LB not working with RDMS
      const filter = ""; //encodeURI(`{"order":"data.createdOn DESC"}`);

      let url = `${apiUrl}content?filter=${filter}`;
      let page = await this.getAxios().get(url);
      await formattingService.formatDates(page.data);
      await formattingService.formatTitles(page.data);

      //filter out content type that should not appear in admin content list
      let data = page.data
        .filter((x) => x.data.contentType !== "menu")
        .filter((x) => x.data.contentType !== "section")
        .filter((x) => x.data.contentType !== "site-settings");

      return data;
    }),
    (exports.getContentByType = async function (contentType) {
      const query = gql`
      {
        contents (contentTypeId : "${contentType}") {
          contentTypeId
          data
        }
      }
      `;

      let data = await this.executeGraphqlQuery(query);

      return data.contents;
      // const query = gql`
      //   {
      //     contents {
      //       contentTypeId
      //       data
      //     }
      //   }
      // `;

      // request("http://localhost:3000/graphql", query).then((data) => {
      //   console.log('data;',data);
      // });

      // const filter = encodeURI(
      //   `{"where":{"data.contentType":"${contentType}"}}`
      // );
      // let url = `${apiUrl}content?filter=${filter}`;
      // let page = await this.getAxios().get(url);
      // return page.data;
    }),
    (exports.getContentType = async function (contentType) {
      const query = gql`
        {
          contentType(systemId:"${contentType}") {
            title
            systemId
            moduleSystemId
            filePath
            data
          }
        }
      `;

      let data = await this.executeGraphqlQuery(query);

      if (data.contentType) {
        return data.contentType;
      }
    }),
    (exports.getContentTypes = async function () {
      const query = gql`
        {
          contentTypes{
            title
            systemId
            moduleSystemId
            filePath
            data
          }
        }
      `;

      let data = await this.executeGraphqlQuery(query);

      if (data.contentTypes) {
        return data.contentTypes;
      }
    }),
    (exports.createContentType = async function (contentType) {
      let url = `${apiUrl}contentTypes`;
      // let contentTypes = await this.getAxios().post(url, contentType);
      this.getAxios()
        .post(url, contentType)
        .then(async function (response) {
          // console.log(response);
          return response.data;
        })
        .catch(function (error) {
          console.log(error.response.data);
          return error;
        });
    }),
    (exports.getContentTopOne = async function (contentType) {
      let results = await this.getContentByType(contentType);
      return results[0];
    }),
    (exports.getContentByUrl = async function (url) {
      // var filter = encodeURI(`{"where":{"data.url":"${url}"}}`);
      // let apiFullUrl = `${apiUrl}content?filter=${filter}`;
      // let record = await this.getAxios().get(apiFullUrl);
      // if (record.data[0] && record.data.length > 0) {
      //   return record;
      // }

      const query = gql`
        {
          content(url: "${url}") {
            id
            contentTypeId
            data
          }
        }
      `;

      let data = await this.executeGraphqlQuery(query);

      if (data.content) {
        return data.content;
      }

      let notFound = { data: {} };
      notFound.data.title = "Not Found";
      notFound.data.body = "Not Found";
      notFound.url = url;
      return notFound;
    }),
    (exports.getContentByContentType = async function (contentType) {
      var filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
      let apiFullUrl = `${apiUrl}content?filter=${filter}`;
      let record = await this.getAxios().get(apiFullUrl);
      if (record.data) {
        return record.data;
      }

      return notFound;
    }),
    (exports.getContentByContentTypeAndTitle = async function (
      contentType,
      title
    ) {
      const filter = `{"where":{"and":[{"data.title":"${title}"},{"data.contentType":"${contentType}"}]}}`;
      const encodedFilter = encodeURI(filter);
      let url = `${apiUrl}content?filter=${encodedFilter}`;
      let pageRecord = await this.getAxios().get(url);
      if (pageRecord.data[0]) {
        //HACK: workaround for loopback bug - lb should filter based on the above filter input, but doesn't for RDBMS
        if (
          pageRecord.data[0].title === title &&
          pageRecord.data[0].contentType === contentType
        ) {
          return pageRecord.data[0];
        } else {
          //filter in code per HACK
          let record = pageRecord.data
            .filter((c) => c.data.contentType == contentType)
            .filter((c) => c.data.title == title);

          if (record && record[0]) {
            return record[0];
          }
        }
        // await this.getPage(pageRecord.data[0].id, pageRecord.data[0]);
        // let page = pageRecord.data[0];
        // page.data.html = pageContent;
        // return page;
      }
      return "not found";
    }),
    (exports.getContentByContentTypeAndTag = async function (contentType, tag) {
      //TODO: add {"order":"data.sort ASC"},
      const filter = `{"where":{"and":[{"data.tags":{"regexp": "${tag}"}},{"data.contentType":"${contentType}"}]}}`;
      const encodedFilter = encodeURI(filter);
      let url = `${apiUrl}content?filter=${encodedFilter}`;
      let pageRecord = await this.getAxios().get(url);
      if (pageRecord.data) {
        return pageRecord.data;
      }
      return "not found";
    }),
    (exports.getContentByUrlAndContentType = async function (
      contentType,
      pageUrl
    ) {
      const filter = `{"where":{"and":[{"url":"${pageUrl}"},{"data.contentType":"${contentType}"}]}}`;
      const encodedFilter = encodeURI(filter);
      let url = `${apiUrl}content?filter=${encodedFilter}`;
      let pageRecord = await this.getAxios().get(url);
      if (pageRecord.data[0]) {
        return pageRecord;
        // await this.getPage(pageRecord.data[0].id, pageRecord.data[0]);
        // let page = pageRecord.data[0];
        // page.data.html = pageContent;
        // return page;
      }
      return "not found";
    }),
    (exports.editInstance = async function (payload) {
      let id = payload.id;
      // console.log('putting payload', payload);
      if (payload.id) {
        delete payload.id;
      }
      if (payload.data && payload.data.id) {
        id = payload.data.id;
        delete payload.data.id;
      }

      return new Promise((resolve, reject) => {
        this.getAxios()
          .put(`/api/content/${id}`, payload)
          .then(async function (response) {
            // console.log("ok", response.data);
            resolve(response.data);
          })
          .catch(function (error) {
            console.log("err");
            reject(error);
          });
      });
    }),
    (exports.createContentInstance = async function (payload) {
      // console.log('createContentInstance payload', payload);
      // let content = {};
      // content.data = payload;
      // this.processContentFields(payload, content);
      console.log("payload", payload);
      if (payload.id || "id" in payload) {
        delete payload.id;
      }

      if (!payload.data) {
        let temp = { data: payload };
        payload = temp;
      }

      return new Promise((resolve, reject) => {
        this.getAxios()
          .post("/api/content/", payload)
          .then(async function (response) {
            // console.log("ok", response.data);
            resolve(response.data);
          })
          .catch(function (error) {
            console.log("err");
            reject(error);
          });
      });
    });

  (exports.getContentById = async function (id) {
    // let url = `${apiUrl}content/${id}`;
    // return this.getAxios()
    //   .get(url)
    //   .then(function (content) {
    //     // console.log('getContentById', content.data);
    //     return content.data;
    //   })
    //   .catch(function (error) {
    //     console.log(`getContentById ERROR, Id:${id}`, error);
    //   });

    const query = gql`
    {
      content(id: "${id}") {
        contentTypeId
        data
        id
      }
    }
  `;

    this.executeGraphqlQuery(query)
      .then((data) => {
        return data.content;
      })
      .catch((err) => {
        console.log(err);
        return "";
      });
  }),
    (exports.asyncForEach = async function (array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    }),
    (exports.getImageUrl = function (img) {
      return `/api/containers/files/download/${img.originalName}`;
    }),
    (exports.getImage = function (img) {
      let url = this.getImageUrl(img);
      return `<img class="img-fluid rounded" src="${url}" />`;
    }),
    (exports.deleteModule = async function (moduleSystemId) {
      let url = `${apiUrl}modules/deleteModule`;
      let objToDelete = { moduleSystemId: moduleSystemId };
      await this.getAxios().post(url, objToDelete);
    });
})(typeof exports === "undefined" ? (this["dataService"] = {}) : exports);
