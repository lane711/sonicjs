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
  const defaultOptions = {
    headers: {},
    baseURL: globalService.baseUrl,
  };
  let newAxiosInstance = axios.create(defaultOptions);
  // console.log("newAxiosInstance", newAxiosInstance);
}

(function (exports) {
  var apiUrl = "/graphql/";
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
      // debugger;
      if (!axiosInstance) {
        // if (true) {

        const defaultOptions = {
          headers: {},
          baseURL: globalService.baseUrl,
        };

        let token = helperService.getCookie("sonicjs_access_token");
        if (token) {
          defaultOptions.headers.Authorization = token;
        }

        axiosInstance = axios.create(defaultOptions);
      }
      // debugger;
      return axiosInstance;
    }),
    (exports.userCreate = async function (email, password) {
      // let result = await this.getAxios().post(apiUrl, {
      //   query: `
      //     mutation{
      //       userCreate(username:"${email}", password:"${password}")
      //       {
      //         username
      //         id
      //       }
      //     }
      //         `,
      // });
      // return result.userCreate;
    });

  (exports.userUpdate = async function (user, sessionId) {
    // debugger;
    let id = user.id;
    delete user.id;
    let data = JSON.stringify(user);
    let result = await this.getAxios().post(apiUrl, {
      query: `
        mutation{
          userUpdate( 
            id:"${id}", 
            profile:"""${data}""",
            sessionId:"${sessionId}"){
              username
          }
        }
            `,
    });

    return result.data;
  }),
    (exports.rolesGet = async function (sessionId) {
      let result = await this.getAxios().post(apiUrl, {
        query: `
      {
        roles (sessionId:"${sessionId}"){
          id
          data
        }
      }
        `,
      });

      if (result.data.data.roles) {
        return result.data.data.roles;
      }
    }),
    (exports.getContent = async function (sessionId) {
      //HACK removing sort bc LB not working with RDMS
      // const filter = ""; //encodeURI(`{"order":"data.createdOn DESC"}`);

      // let url = `${apiUrl}content?filter=${filter}`;
      // let page = await this.getAxios().get(url);

      let result = await this.getAxios().post(apiUrl, {
        query: `
        {
          contents (sessionId:"${sessionId}")
          {
            id
            contentTypeId
            data
            createdByUserId {
              id
              username
            }
            createdOn
            lastUpdatedByUserId {
              id
              username
            }	
            updatedOn
          }
        }
          `,
      });

      if (result.data.data.contents) {
        let content = result.data.data.contents;
        await formattingService.formatDates(content);
        await formattingService.formatTitles(content);
        return content;
      }
    }),
    (exports.getContentAdmin = async function (sessionId) {
      let contents = await this.getContent();
      //HACK removing sort bc LB not working with RDMS
      // const filter = ""; //encodeURI(`{"order":"data.createdOn DESC"}`);

      // let url = `${apiUrl}content?filter=${filter}`;
      // let page = await this.getAxios().get(url);
      // await formattingService.formatDates(page.data);
      // await formattingService.formatTitles(page.data);

      //filter out content type that should not appear in admin content list
      let data = contents
        .filter((x) => x.contentTypeId !== "menu")
        .filter((x) => x.contentTypeId !== "section")
        .filter((x) => x.contentTypeId !== "site-settings");

      return data;
    }),
    (exports.getContentByType = async function (contentType, sessionId) {
      // const query = gql`
      // {
      //   contents (contentTypeId : "${contentType}") {
      //     contentTypeId
      //     data
      //   }
      // }
      // `;

      // let data = await this.executeGraphqlQuery(query);

      // return data.contents;

      let result = await this.getAxios().post(apiUrl, {
        query: `
        {
          contents (contentTypeId : "${contentType}", sessionId:"${sessionId}") {
            id
            contentTypeId
            data
          }
        }
            `,
      });

      return result.data.data.contents;
    }),
    (exports.getPageTemplates = async function (sessionId) {
      let pages = await this.getContentByType("page");

      //filter out content type that should not appear in admin content list
      let data = pages.filter((x) => x.data.isPageTemplate);

      // data.push({ id: 0, data: {title: "None" }});

      return data;
    }),
    (exports.contentTypeGet = async function (contentType, sessionId) {
      // debugger;
      let result = await this.getAxios().post(apiUrl, {
        query: `
            {
                contentType(systemId:"${contentType}", sessionId:"${sessionId}") {
                  title
                  systemId
                  moduleSystemId
                  filePath
                  data
                  permissions
                }
              }
            `,
      });

      return result.data.data.contentType;
    }),
    (exports.contentTypesGet = async function (sessionId) {
      let result = await this.getAxios().post(apiUrl, {
        query: `
        {
          contentTypes (sessionId:"${sessionId}") {
            title
            systemId
            moduleSystemId
            filePath
            data
          }
        }
          `,
      });

      return result.data.data.contentTypes;
    }),
    (exports.queryfy = function (obj) {
      // Make sure we don't alter integers.
      if (typeof obj === "number") {
        return obj;
      }

      if (Array.isArray(obj)) {
        const props = obj.map((value) => `${queryfy(value)}`).join(",");
        return `[${props}]`;
      }

      if (typeof obj === "object") {
        const props = Object.keys(obj)
          .map((key) => `${key}:${queryfy(obj[key])}`)
          .join(",");
        return `{${props}}`;
      }

      return JSON.stringify(obj);
    }),
    (exports.contentTypeUpdate = async function (contentType, sessionId) {
      // debugger;
      let components = JSON.stringify(contentType.data);
      let permissions = JSON.stringify(contentType.permissions);

      let result = await this.getAxios().post(apiUrl, {
        query: `
        mutation{
          contentTypeUpdate( 
            title:"${contentType.title}", 
            moduleSystemId:"${contentType.moduleSystemId}", 
            systemId:"${contentType.systemId}", 
            permissions:"""${permissions}""",
            data:"""${components}""",
            sessionId:"${sessionId}"){
              title
          }
        }
            `,
      });

      return result.data.data.contentType;
    }),
    (exports.contentTypeDelete = async function (contentType, sessionId) {
      let components = JSON.stringify(contentType.data);
      let result = await this.getAxios().post(apiUrl, {
        query: `
        mutation{
          contentTypeDelete( 
            systemId:"${contentType}", sessionId:"${sessionId}"){
              title
          }
        }
            `,
      });

      return result.data.data.contentType;
    }),
    (exports.contentTypeCreate = async function (contentType, sessionId) {
      let query = `
      mutation{
        contentTypeCreate( 
          title:"${contentType.title}", 
          moduleSystemId:"${contentType.moduleSystemId}", 
          systemId:"${contentType.systemId}",
          sessionId:"${sessionId}")
          {
            title
        }
      }
          `;
      let result = await this.getAxios().post(apiUrl, {
        query: query,
      });

      return result.data.data.contentType;
    }),
    (exports.getContentTopOne = async function (contentType, sessionId) {
      debugger;
      let results = await this.getContentByType(contentType);
      return results[0];
    }),
    (exports.getContentByUrl = async function (url, sessionId) {
      // var filter = encodeURI(`{"where":{"data.url":"${url}"}}`);
      // let apiFullUrl = `${apiUrl}content?filter=${filter}`;
      // let record = await this.getAxios().get(apiFullUrl);
      // if (record.data[0] && record.data.length > 0) {
      //   return record;
      // }

      // const query = gql`
      //   {
      //     content(url: "${url}") {
      //       id
      //       contentTypeId
      //       data
      //     }
      //   }
      // `;

      // let data = await this.executeGraphqlQuery(query);

      // if (data.content) {
      //   return data.content;
      // }

      let result = await this.getAxios().post(apiUrl, {
        query: `
            {
              content(url: "${url}", sessionId:"${sessionId}") {
                id
                contentTypeId
                data
              }
            }
          `,
      });

      if (result.data.data.content) {
        return result.data.data.content;
      }

      let notFound = { data: {} };
      notFound.data.title = "Not Found";
      notFound.data.body = "Not Found";
      notFound.url = url;
      return notFound;
    }),
    (exports.getContentByContentType = async function (contentType, sessionId) {
      let query = `
      {
        contents(contentTypeId: "${contentType}", sessionId:"${sessionId}") {
          id
          contentTypeId
          data
        }
      }
    `;
      let result = await this.getAxios().post(apiUrl, {
        query: query,
      });

      if (result.data.data.contents) {
        return result.data.data.contents;
      }

      // var filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
      // let apiFullUrl = `${apiUrl}content?filter=${filter}`;
      // let record = await this.getAxios().get(apiFullUrl);
      // if (record.data) {
      //   return record.data;
      // }

      return "notFound";
    }),
    (exports.getContentByContentTypeAndTitle = async function (
      contentType,
      title,
      sessionId
    ) {
      let allOfContentType = await this.getContentByContentType(
        contentType,
        sessionId
      );
      if (allOfContentType) {
        let contentByTitle = allOfContentType.filter(
          (c) => c.data.title.toLowerCase() === title.toLowerCase()
        )[0];
        return contentByTitle;
      }
    }),
    (exports.getContentByContentTypeAndTag = async function (contentType, tag, sessionId) {
      let allOfContentType = await this.getContentByContentType(contentType);
      if (allOfContentType) {
        let contentByTag = allOfContentType.filter((x) => x.data.tags === tag);
        return contentByTag;
      }
    }),
    (exports.getContentByUrlAndContentType = async function (
      contentType,
      pageUrl,
      sessionId
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

      let data = payload.data;
      if (!data) {
        data = payload;
      }

      let dataString = JSON.stringify(data);

      let query = `
      mutation{
        contentUpdate( 
          id:"${id}", 
          url:"${data.url}", 
          data:"""${dataString}"""){
            id
            url
            contentTypeId
        }
      }
          `;

      let result = await this.getAxios().post(apiUrl, {
        query: query,
      });

      return result.data.data.contentUpdate;
    }),
    (exports.contentCreate = async function (payload, autoGenerateUrl = true, sessionId) {
      if (
        payload.data.contentType !== "page" &&
        payload.data.contentType !== "blog"
      ) {
        if (autoGenerateUrl) {
          payload.data.url = helperService.generateSlugFromContent(
            payload.data,
            true,
            true
          );
        }
      }

      let query = `
      mutation{
        contentCreate( 
          contentTypeId:"${payload.data.contentType}", 
          url:"${payload.data.url}", 
          createdByUserId:"5fd834ec29f419535f049803"
          data:"""${JSON.stringify(payload.data)}""",
          sessionId:"${sessionId}"){
            id
            url
            contentTypeId
        }
      }
          `;

      let result = await this.getAxios().post(apiUrl, {
        query: query,
      });

      return result.data.data.contentCreate;
    });

  exports.contentDelete = async function (id, sessionId) {
    let query = `
      mutation{
        contentDelete( 
          id:"${id}",
          sessionId:"${sessionId}"){
            id
          }
      }
          `;

    let result = await this.getAxios().post(apiUrl, {
      query: query,
    });

    return result.data.data.contentCreate;
  };

  (exports.getContentById = async function (id, sessionId) {
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

    //   const query = gql`
    //   {
    //     content(id: "${id}") {
    //       contentTypeId
    //       data
    //       id
    //     }
    //   }
    // `;

    //   this.executeGraphqlQuery(query)
    //     .then((data) => {
    //       return data.content;
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //       return "";
    //     });

    let result = await this.getAxios().post(apiUrl, {
      query: `
        {
          content(id: "${id}",
          sessionId:"${sessionId}") {
            contentTypeId
            data
            id
            url
          }
        }
          `,
    });

    if (result.data.data.content) {
      //copy id and contentType into data for form builder
      result.data.data.content.data.id = result.data.data.content.id;
      result.data.data.content.data.contentType =
        result.data.data.content.contentTypeId;

      return result.data.data.content;
    }
  }),
    (exports.fileUpdate = async function (filePath, fileContent, sessionId) {
      let result = await this.getAxios().post(apiUrl, {
        query: `
      mutation{
        fileUpdate( 
          filePath:"${filePath}", 
          fileContent:"""${fileContent}""",
          sessionId:"${sessionId}"
          )
          { 
            filePath 
          }
      }
          `,
      });

      return result.data.data.fileUpdate;
    }),
    (exports.fileCreate = async function (filePath, fileContent, sessionId) {
      let query = `
      mutation{
        fileCreate( 
          filePath:"${filePath}", 
          fileContent:"""${fileContent}""",
          sessionId:"${sessionId}"
          )
          { 
            filePath 
          }
      }
          `;
      let contentLength = fileContent.length;

      let result = await this.getAxios().post(apiUrl, {
        query: query,
      });

      return result.data.data.fileUpdate;
    }),
    (exports.getView = async function (contentType, viewModel, viewPath, sessionId) {
      let result = await this.getAxios().post(apiUrl, {
        query: `
        {
          view(
            contentType:"${contentType}",
            viewModel: """${JSON.stringify(viewModel)}""",
            viewPath:"${viewPath}",
            sessionId:"${sessionId}"
          ) {
          html
        }
      }
          `,
      });

      if (result.data.data.view.html) {
        return result.data.data.view.html;
      }

      // var filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
      // let apiFullUrl = `${apiUrl}content?filter=${filter}`;
      // let record = await this.getAxios().get(apiFullUrl);
      // if (record.data) { p
      //   return record.data;
      // }

      return notFound;
    }),
    (exports.asyncForEach = async function (array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    }),
    (exports.getImageUrl = function (file) {
      return `/assets/uploads/${file.file}`;
    }),
    (exports.getImage = function (img) {
      let url = this.getImageUrl(img);
      return `<img class="img-fluid rounded" src="${url}" />`;
    }),
    (exports.deleteModule = async function (moduleSystemId, sessionId) {
      // debugger;
      // let url = `${apiUrl}modules/deleteModule`;
      // let objToDelete = { moduleSystemId: moduleSystemId };
      // await this.getAxios().post(url, objToDelete);

      let query = `
      mutation{
        moduleTypeDelete( 
          systemId:"${moduleSystemId}",
          sessionId:"${sessionId}")
          { systemId }
      }
          `;

      let result = await this.getAxios().post(apiUrl, {
        query: query,
      });
    }),
    (exports.moduleCreate = async function (payload, sessionId) {
      let result = await this.getAxios().post(apiUrl, {
        query: `
        mutation{
          moduleTypeCreate(
            title:"${payload.data.title}", 
            enabled:${payload.data.enabled}, 
            systemId:"${payload.data.systemId}", 
            canBeAddedToColumn: ${payload.data.canBeAddedToColumn},
            sessionId:"${sessionId}"
            )
          {		
            title
            enabled
            systemId
            canBeAddedToColumn
          }
        }
          `,
      });

      return result.data.data.fileUpdate;
    }),
    (exports.moduleEdit = async function (payload, sessionId) {
      let result = await this.getAxios().post(apiUrl, {
        query: `
        mutation{
          moduleTypeUpdate(
            title:"${payload.data.title}", 
            enabled:${payload.data.enabled}, 
            systemId:"${payload.data.systemId}", 
            canBeAddedToColumn: ${payload.data.canBeAddedToColumn},
            singleInstance: ${payload.data.singleInstance},
            sessionId:"${sessionId}"
            )
          {		
            title
            enabled
            systemId
            canBeAddedToColumn
          }
        }
          `,
      });

      return result.data.data;
    }),
    (exports.getFiles = async function () {
      let files = [{ title: "my image", filePath: "/images/test123.png" }];
      return files;
    });
})(typeof exports === "undefined" ? (this["dataService"] = {}) : exports);
