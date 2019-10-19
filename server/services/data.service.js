var eventBusService = require('./event-bus.service');
var globalService = require('./global.service');
var pageBuilderService = require('./page-builder.service');
var formService = require('./form.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;

const apiUrl = '/api/';
var pageContent = '';
var page;
var id;
var axiosInstance;

(async () => {
    // if(baseUrl){
    //     axiosInstance = axios.create({ baseURL: baseUrl });
    // }
  })();

module.exports = {

    startup: async function () {
        eventBusService.on('requestBegin', async function (options) {
            // console.log('data service startup')
            if(options){
                let baseUrl = globalService.getBaseUrl();
                // console.log('data service ' + baseUrl)
                axiosInstance = axios.create({ baseURL: baseUrl });
            }
        });
    },

    getContent: async function () {
        let url = `${apiUrl}contents`;
        let page = await axiosInstance.get(url);
        return page.data;
    },

    getContentByType: async function (contentType) {
        const filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
        let url = `${apiUrl}contents?filter=${filter}`;
        let page = await axiosInstance.get(url);
        return page.data;
    },

    getContentType: async function (contentType) {
        const filter = encodeURI(`{"where":{"systemid":"${contentType}"}}`);
        let url = `${apiUrl}contentTypes?filter=${filter}`;
        let contentTypeRecord = await axiosInstance.get(url);
        // console.log('contentTypeRecord.data', contentTypeRecord.data[0]);
        return contentTypeRecord.data[0];
    },

    getContentTypes: async function () {
        let url = `${apiUrl}contentTypes`;
        let contentTypes = await axiosInstance.get(url);
        // console.log('contentTypeRecord.data', contentTypeRecord.data[0]);
        return contentTypes.data;
    },

    getContentTopOne: async function (contentType) {
        let results = await this.getContentByType(contentType);
        return results[0];
    },

    getContentByUrl: async function (url) {
        var  filter = encodeURI(`{"where":{"data.url":"${url}"}}`);
        let apiFullUrl = `${apiUrl}contents?filter=${filter}`;
        // var instance = axios.create({ baseURL: 'http://localhost:3018' });
        let record = await axiosInstance.get(apiFullUrl);
        if (record.data[0]) {
            return record;
        }

        let notFound = { data: {} };
        notFound.data.title = "Not Found";
        notFound.data.body = "Not Found";
        notFound.url = url;
        return notFound;
    },

    getContentByContentType: async function (contentType) {
        var  filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
        let apiFullUrl = `${apiUrl}contents?filter=${filter}`;
        let record = await axiosInstance.get(apiFullUrl);
        if (record.data) {
            return record.data;
        }

        return notFound;
    },
    
    getContentByContentTypeAndTitle: async function (contentType, title) {
        const filter = `{"where":{"and":[{"data.title":"${title}"},{"data.contentType":"${contentType}"}]}}`;
        const encodedFilter = encodeURI(filter);
        let url = `${apiUrl}contents?filter=${encodedFilter}`;
        let pageRecord = await axiosInstance.get(url);
        if (pageRecord.data[0]) {
            return pageRecord.data[0];
            // await this.getPage(pageRecord.data[0].id, pageRecord.data[0]);
            // let page = pageRecord.data[0];
            // page.data.html = pageContent;
            // return page;
        }
        return 'not found';
    },

    getContentByUrlAndContentType: async function (contentType, pageUrl) {
        const filter = `{"where":{"and":[{"url":"${pageUrl}"},{"data.contentType":"${contentType}"}]}}`;
        const encodedFilter = encodeURI(filter);
        let url = `${apiUrl}contents?filter=${encodedFilter}`;
        let pageRecord = await axiosInstance.get(url);
        if (pageRecord.data[0]) {
            return pageRecord;
            // await this.getPage(pageRecord.data[0].id, pageRecord.data[0]);
            // let page = pageRecord.data[0];
            // page.data.html = pageContent;
            // return page;
        }
        return 'not found';
    },

    getContentById: async function (id) {
        let url = `${apiUrl}contents/${id}`;
        let content = await axiosInstance.get(url);
        return content.data;
    },

    asyncForEach: async function (array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    },

    getImageUrl: function (img) {
        return `/api/containers/files/download/${img.originalName}`;
    },

    getImage: function (img) {
        let url = this.getImageUrl(img);
        return `<img class="img-fluid rounded" src="${url}" />`;
    }

}