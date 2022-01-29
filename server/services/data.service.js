// check if running in node (and not the browser)
if (typeof module !== 'undefined' && module.exports) {
  // var loopback = require("loopback");
  var emitterService = require('./emitter.service')
  var globalService = require('./global.service')
  const pageBuilderService = require('./page-builder.service')
  const formService = require('./form.service')
  var helperService = require('./helper.service')
  var formattingService = require('./formatting.service')
  var _ = require('underscore')
  var axios = require('axios')
  const fs = require('fs')
  const ShortcodeTree = require('shortcode-tree').ShortcodeTree
  const chalk = require('chalk')
  // const { request, gql } = require("graphql-request");
  var { GraphQLClient, gql, request } = require('graphql-request')

  const log = console.log
} else {
  // var globalService = {};
  // const { request, gql } = require("graphql-request");
  const defaultOptions = {
    headers: {},
    baseURL: globalService.baseUrl
  }
  const newAxiosInstance = axios.create(defaultOptions)
  // console.log("newAxiosInstance", newAxiosInstance);
}

(function (exports) {
  const apiUrl = '/graphql/'
  const pageContent = ''
  let page
  let id
  let axiosInstance;

  (exports.startup = async function () {
    emitterService.on('requestBegin', async function (options) {
      // console.log('data service startup')
      if (options) {
        const defaultOptions = {
          headers: {},
          baseURL: globalService.baseUrl
        }

        if (
          options.req.signedCookies &&
          options.req.signedCookies.sonicjs_access_token
        ) {
          defaultOptions.headers.Authorization =
            options.req.signedCookies.sonicjs_access_token
        }

        axiosInstance = axios.create(defaultOptions)

        // axiosInstance = axios.create({ baseURL: globalService.baseUrl });
      }
    })
  }),
  (exports.executeGraphqlQuery = async function (query) {
    const endpoint = `${globalService.baseUrl}/graphql`

    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        authorization: 'Bearer MY_TOKEN'
      }
    })

    const data = graphQLClient.request(query)
    return data
  }),
  (exports.getAxios = function () {
    // TODO add auth
    // debugger;
    if (!axiosInstance) {
      // if (true) {

      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        baseURL: globalService.baseUrl,
        cookie:
            'sonicjs=s%3AMmvj7HC35YSG-RP1WEY6G3NS7mrSRFcN.EoldLokzB5IMX34xGLC2QwbU0HZn2dSFmtQ9BhPB26w'
      }

      const token = helperService.getCookie('sonicjs_access_token')
      if (token) {
        defaultOptions.headers.Authorization = token
      }

      axiosInstance = axios.create(defaultOptions)
      axiosInstance.defaults.withCredentials = true
    }
    // debugger;
    return axiosInstance
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

  (exports.userUpdate = async function (user, sessionID) {
    // debugger;
    const id = user.id
    delete user.id
    const data = JSON.stringify(user)
    const result = await this.getAxios().post(apiUrl, {
      query: `
        mutation{
          userUpdate( 
            id:"${id}", 
            profile:"""${data}""",
            sessionID:"${sessionID}"){
              username
          }
        }
            `
    })

    return result.data
  }),
  (exports.userDelete = async function (id, sessionID) {
    debugger
    const query = `
      mutation{
        userDelete( 
          id:"${id}",
          sessionID:"${sessionID}"){
            id
          }
      }
          `

    const result = await this.getAxios().post(apiUrl, {
      query: query
    })

    return result.data.data.userDelete
  }),
  (exports.rolesGet = async function (sessionID) {
    const result = await this.getAxios().post(apiUrl, {
      query: `
      {
        roles (sessionID:"${sessionID}"){
          id
          data
        }
      }
        `
    })

    if (result.data.data.roles) {
      return result.data.data.roles
    }
  }),
  (exports.getContent = async function (sessionID) {
    // HACK removing sort bc LB not working with RDMS
    // const filter = ""; //encodeURI(`{"order":"data.createdOn DESC"}`);

    // let url = `${apiUrl}content?filter=${filter}`;
    // let page = await this.getAxios().get(url);

    const result = await this.getAxios().post(apiUrl, {
      query: `
        {
          contents (sessionID:"${sessionID}")
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
          `
    })

    if (result.data.data.contents) {
      const content = result.data.data.contents
      await formattingService.formatDates(content)
      await formattingService.formatTitles(content)
      return content
    }
  }),
  (exports.getContentAdmin = async function (sessionID) {
    const contents = await this.getContent(sessionID)
    const data = _.sortBy(contents, 'updatedOn')
    const dataFiltered = data.filter(d => d.contentTypeId === 'page' || d.contentTypeId === 'blog')
    return dataFiltered
  }),
  (exports.getContentByType = async function (contentType, sessionID) {
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

    const result = await this.getAxios().post(apiUrl, {
      query: `
        {
          contents (contentTypeId : "${contentType}", sessionID:"${sessionID}") {
            id
            contentTypeId
            data
            createdOn
          }
        }
            `
    })

    return result.data.data.contents
  }),
  (exports.getPageTemplates = async function (sessionID) {
    const pages = await this.getContentByType('page', sessionID)

    // filter out content type that should not appear in admin content list
    const data = pages.filter((x) => x.data.isPageTemplate)

    // data.push({ id: 0, data: {title: "None" }});

    return data
  }),
  (exports.contentTypeGet = async function (contentType, sessionID) {
    // debugger;
    const result = await this.getAxios().post(apiUrl, {
      query: `
            {
                contentType(systemId:"${contentType}", sessionID:"${sessionID}") {
                  title
                  systemId
                  moduleSystemId
                  filePath
                  data
                  permissions
                }
              }
            `
    })

    return result.data.data.contentType
  }),
  (exports.contentTypesGet = async function (sessionID) {
    const result = await this.getAxios().post(apiUrl, {
      query: `
        {
          contentTypes (sessionID:"${sessionID}") {
            title
            systemId
            moduleSystemId
            filePath
            data
          }
        }
          `
    })

    return result.data.data.contentTypes
  }),
  (exports.queryfy = function (obj) {
    // Make sure we don't alter integers.
    if (typeof obj === 'number') {
      return obj
    }

    if (Array.isArray(obj)) {
      const props = obj.map((value) => `${queryfy(value)}`).join(',')
      return `[${props}]`
    }

    if (typeof obj === 'object') {
      const props = Object.keys(obj)
        .map((key) => `${key}:${queryfy(obj[key])}`)
        .join(',')
      return `{${props}}`
    }

    return JSON.stringify(obj)
  }),
  (exports.contentTypeUpdate = async function (contentType, sessionID) {
    // debugger;
    const components = JSON.stringify(contentType.data)
    const permissions = JSON.stringify(contentType.permissions)

    const query = `
      mutation{
        contentTypeUpdate( 
          title:"${contentType.title}", 
          moduleSystemId:"${contentType.moduleSystemId}", 
          systemId:"${contentType.systemId}", 
          permissions:"""${permissions}""",
          data:"""${components}""",
          sessionID:"${sessionID}"){
            title
        }
      }
          `
    const result = await this.getAxios().post(apiUrl, {
      query: query
    })

    return result.data.data.contentType
  }),
  (exports.contentTypeDelete = async function (contentType, sessionID) {
    const components = JSON.stringify(contentType.data)
    const result = await this.getAxios().post(apiUrl, {
      query: `
        mutation{
          contentTypeDelete( 
            systemId:"${contentType}", sessionID:"${sessionID}"){
              title
          }
        }
            `
    })

    return result.data.data.contentType
  }),
  (exports.contentTypeCreate = async function (contentType, sessionID) {
    const query = `
      mutation{
        contentTypeCreate( 
          title:"${contentType.title}", 
          moduleSystemId:"${contentType.moduleSystemId}", 
          systemId:"${contentType.systemId}",
          sessionID:"${sessionID}")
          {
            title
        }
      }
          `
    const result = await this.getAxios().post(apiUrl, {
      query: query
    })

    return result.data.data.contentType
  }),
  (exports.getContentTopOne = async function (contentType, sessionID) {
    const results = await this.getContentByType(contentType, sessionID)
    if (results) {
      return results[0]
    } else {
      throw new Error(
          `Could not find element getContentTopOne: ${contentType}, ${sessionID}`
      )
    }
  }),
  (exports.getContentByUrl = async function (url, sessionID) {
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

    const result = await this.getAxios().post(apiUrl, {
      query: `
            {
              content(url: "${url}", sessionID:"${sessionID}") {
                id
                contentTypeId
                data
              }
            }
          `
    })

    if (result.data.data.content) {
      return result.data.data.content
    }

    const notFound = { data: {} }
    notFound.data.title = 'Not Found'
    notFound.data.body = 'Not Found'
    notFound.data.status = 'Not Found'
    notFound.url = url
    return notFound
  }),
  (exports.getContentByContentType = async function (contentType, sessionID) {
    const query = `
      {
        contents(contentTypeId: "${contentType}", sessionID:"${sessionID}") {
          id
          contentTypeId
          data
        }
      }
    `
    const result = await this.getAxios().post(apiUrl, {
      query: query
    })

    if (result.data.data.contents) {
      return result.data.data.contents
    }

    // var filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
    // let apiFullUrl = `${apiUrl}content?filter=${filter}`;
    // let record = await this.getAxios().get(apiFullUrl);
    // if (record.data) {
    //   return record.data;
    // }

    return 'notFound'
  }),
  (exports.getContentByContentTypeAndTitle = async function (
    contentType,
    title,
    sessionID
  ) {
    const allOfContentType = await this.getContentByContentType(
      contentType,
      sessionID
    )
    if (allOfContentType) {
      const contentByTitle = allOfContentType.filter(
        (c) => c.data.title.toLowerCase() === title.toLowerCase()
      )[0]
      return contentByTitle
    }
  }),
  (exports.getContentByContentTypeAndTag = async function (
    contentType,
    tag,
    sessionID
  ) {
    const allOfContentType = await this.getContentByContentType(contentType)
    if (allOfContentType) {
      const contentByTag = allOfContentType.filter((x) =>
        x.data.tags.includes(tag.id)
      )
      return contentByTag
    }
  }),
  (exports.getContentByUrlAndContentType = async function (
    contentType,
    pageUrl,
    sessionID
  ) {
    const filter = `{"where":{"and":[{"url":"${pageUrl}"},{"data.contentType":"${contentType}"}]}}`
    const encodedFilter = encodeURI(filter)
    const url = `${apiUrl}content?filter=${encodedFilter}`
    const pageRecord = await this.getAxios().get(url)
    if (pageRecord.data[0]) {
      return pageRecord
      // await this.getPage(pageRecord.data[0].id, pageRecord.data[0]);
      // let page = pageRecord.data[0];
      // page.data.html = pageContent;
      // return page;
    }
    return 'not found'
  }),
  (exports.editInstance = async function (payload, sessionID) {
    let id = payload.id
    // console.log('putting payload', payload);
    if (payload.id) {
      delete payload.id
    }
    if (payload.data && payload.data.id) {
      id = payload.data.id
      delete payload.data.id
    }

    let data = payload.data
    if (!data) {
      data = payload
    }

    const dataString = JSON.stringify(data)

    const query = `
      mutation{
        contentUpdate( 
          id:"${id}", 
          url:"${data.url}", 
          data:"""${dataString}""",
          sessionID:"${sessionID}"){
            id
            url
            contentTypeId
        }
      }
          `

    const result = await this.getAxios().post(apiUrl, {
      query: query
    })

    return result.data.data.contentUpdate
  }),
  (exports.contentCreate = async function (
    payload,
    autoGenerateUrl = true,
    sessionID
  ) {
    if (
      payload.data.contentType !== 'page' &&
        payload.data.contentType !== 'blog'
    ) {
      if (autoGenerateUrl) {
        payload.data.url = helperService.generateSlugFromContent(
          payload.data,
          true,
          true
        )
      }
    }

    const query = `
      mutation{
        contentCreate( 
          contentTypeId:"${payload.data.contentType}", 
          url:"${payload.data.url}", 
          data:"""${JSON.stringify(payload.data)}""",
          sessionID:"${sessionID}"){
            id
            url
            contentTypeId
        }
      }
          `

    const result = await this.getAxios().post(apiUrl, {
      query: query
    })

    if (emitterService) {
      emitterService.emit('contentCreated', result)
    }

    return result.data.data.contentCreate
  })

  exports.contentDelete = async function (id, sessionID) {
    const query = `
      mutation{
        contentDelete( 
          id:"${id}",
          sessionID:"${sessionID}"){
            id
          }
      }
          `

    const result = await this.getAxios().post(apiUrl, {
      query: query
    })

    return result.data.data.contentCreate
  };

  (exports.getContentById = async function (id, sessionID) {
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

    const result = await this.getAxios().post(apiUrl, {
      query: `
        {
          content(id: "${id}",
          sessionID:"${sessionID}") {
            contentTypeId
            data
            id
            url
          }
        }
          `
    })

    if (result.data.data.content) {
      // copy id and contentType into data for form builder
      result.data.data.content.data.id = result.data.data.content.id
      result.data.data.content.data.contentType =
        result.data.data.content.contentTypeId

      return result.data.data.content
    }
  }),
  (exports.fileUpdate = async function (filePath, fileContent, sessionID) {
    const result = await this.getAxios().post(apiUrl, {
      query: `
      mutation{
        fileUpdate( 
          filePath:"${filePath}", 
          fileContent:"""${fileContent}""",
          sessionID:"${sessionID}"
          )
          { 
            filePath 
          }
      }
          `
    })

    return result.data.data.fileUpdate
  }),
  (exports.fileCreate = async function (filePath, fileContent, sessionID) {
    const query = `
      mutation{
        fileCreate( 
          filePath:"${filePath}", 
          fileContent:"""${fileContent}""",
          sessionID:"${sessionID}"
          )
          { 
            filePath 
          }
      }
          `
    const contentLength = fileContent.length

    const result = await this.getAxios().post(apiUrl, {
      query: query
    })

    return result.data.data.fileUpdate
  }),
  (exports.getView = async function (
    contentType,
    viewModel,
    viewPath,
    sessionID
  ) {
    const result = await this.getAxios().post(apiUrl, {
      query: `
        {
          view(
            contentType:"${contentType}",
            viewModel: """${JSON.stringify(viewModel)}""",
            viewPath:"${viewPath}",
            sessionID:"${sessionID}"
          ) {
          html
        }
      }
          `
    })

    if (result.data.data.view.html) {
      return result.data.data.view.html
    }

    // var filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
    // let apiFullUrl = `${apiUrl}content?filter=${filter}`;
    // let record = await this.getAxios().get(apiFullUrl);
    // if (record.data) { p
    //   return record.data;
    // }

    return notFound
  }),
  (exports.asyncForEach = async function (array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }),
  (exports.getImage = function (img) {
    const url = this.getImageUrl(img)
    return `<img class="img-fluid rounded" src="${url}" />`
  }),
  (exports.deleteModule = async function (moduleSystemId, sessionID) {
    // debugger;
    // let url = `${apiUrl}modules/deleteModule`;
    // let objToDelete = { moduleSystemId: moduleSystemId };
    // await this.getAxios().post(url, objToDelete);

    const query = `
      mutation{
        moduleTypeDelete( 
          systemId:"${moduleSystemId}",
          sessionID:"${sessionID}")
          { systemId }
      }
          `

    const result = await this.getAxios().post(apiUrl, {
      query: query
    })
  }),
  (exports.moduleCreate = async function (payload, sessionID) {
    const result = await this.getAxios().post(apiUrl, {
      query: `
        mutation{
          moduleTypeCreate(
            title:"${payload.data.title}", 
            enabled:${payload.data.enabled}, 
            systemId:"${payload.data.systemId}", 
            canBeAddedToColumn: ${payload.data.canBeAddedToColumn},
            sessionID:"${sessionID}"
            )
          {		
            title
            enabled
            systemId
            canBeAddedToColumn
          }
        }
          `
    })

    return result.data.data.fileUpdate
  }),
  (exports.moduleEdit = async function (payload, sessionID) {
    const result = await this.getAxios().post(apiUrl, {
      query: `
        mutation{
          moduleTypeUpdate(
            title:"${payload.data.title}", 
            enabled:${payload.data.enabled}, 
            systemId:"${payload.data.systemId}", 
            canBeAddedToColumn: ${payload.data.canBeAddedToColumn},
            singleInstance: ${payload.data.singleInstance},
            sessionID:"${sessionID}"
            )
          {		
            title
            enabled
            systemId
            canBeAddedToColumn
          }
        }
          `
    })

    return result.data.data
  }),
  (exports.mediaDelete = async function (id, sessionID) {
    const query = `
        mutation{
          mediaDelete( 
            id:"${id}",
            sessionID:"${sessionID}"){
              id
            }
        }
            `

    const result = await this.getAxios().post(apiUrl, {
      query: query
    })

    return result.data.data.mediaDelete
  })
  exports.getFiles = async function () {
    const files = [{ title: 'my image', filePath: '/images/test123.png' }]
    return files
  }
})(typeof exports === 'undefined' ? (this.dataService = {}) : exports)
