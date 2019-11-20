if (require) {
    var eventBusService = require('./event-bus.service');
    var globalService = require('./global.service');
    var pageBuilderService = require('./page-builder.service');
    var formService = require('./form.service');

    var axios = require('axios');
    var fs = require('fs');
    var cheerio = require('cheerio')
    var ShortcodeTree = require('shortcode-tree').ShortcodeTree;
    var chalk = require('chalk');
    var log = console.log;
}

(function (exports) {

    var apiUrl = '/api/';
    var pageContent = '';
    var page;
    var id;

    exports.startup = async function () {
        eventBusService.on('requestBegin', async function (options) {
            // console.log('data service startup')
            if (options) {
                let baseUrl = globalService.getBaseUrl();
                globalService.axiosInstance = axios.create({ baseURL: baseUrl });
            }
        });
    },

        exports.getContent = async function () {
            const filter = encodeURI(`{"order":"data.createdOn DESC"}`);
            let url = `${apiUrl}contents?filter=${filter}`;
            let page = await globalService.axiosInstance.get(url);
            return page.data;
        },

        exports.getContentByType = async function (contentType) {
            const filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
            let url = `${apiUrl}contents?filter=${filter}`;
            let page = await globalService.axiosInstance.get(url);
            return page.data;
        },

        exports.getContentType = async function (contentType) {
            const filter = encodeURI(`{"where":{"systemid":"${contentType}"}}`);
            let url = `${apiUrl}contentTypes?filter=${filter}`;
            let contentTypeRecord = await globalService.axiosInstance.get(url);
            // console.log('contentTypeRecord.data', contentTypeRecord.data[0]);
            return contentTypeRecord.data[0];
        },

        exports.getContentTypes = async function () {
            let url = `${apiUrl}contentTypes`;
            let contentTypes = await globalService.axiosInstance.get(url);
            // console.log('contentTypeRecord.data', contentTypeRecord.data[0]);
            return contentTypes.data;
        },

        exports.getContentTopOne = async function (contentType) {
            let results = await this.getContentByType(contentType);
            return results[0];
        },

        exports.getContentByUrl = async function (url) {
            var filter = encodeURI(`{"where":{"data.url":"${url}"}}`);
            let apiFullUrl = `${apiUrl}contents?filter=${filter}`;
            // var instance = axios.create({ baseURL: 'http://localhost:3018' });
            let record = await globalService.axiosInstance.get(apiFullUrl);
            if (record.data[0]) {
                return record;
            }

            let notFound = { data: {} };
            notFound.data.title = "Not Found";
            notFound.data.body = "Not Found";
            notFound.url = url;
            return notFound;
        },

        exports.getContentByContentType = async function (contentType) {
            var filter = encodeURI(`{"where":{"data.contentType":"${contentType}"}}`);
            let apiFullUrl = `${apiUrl}contents?filter=${filter}`;
            let record = await globalService.axiosInstance.get(apiFullUrl);
            if (record.data) {
                return record.data;
            }

            return notFound;
        },

        exports.getContentByContentTypeAndTitle = async function (contentType, title) {
            const filter = `{"where":{"and":[{"data.title":"${title}"},{"data.contentType":"${contentType}"}]}}`;
            const encodedFilter = encodeURI(filter);
            let url = `${apiUrl}contents?filter=${encodedFilter}`;
            let pageRecord = await globalService.axiosInstance.get(url);
            if (pageRecord.data[0]) {
                return pageRecord.data[0];
                // await this.getPage(pageRecord.data[0].id, pageRecord.data[0]);
                // let page = pageRecord.data[0];
                // page.data.html = pageContent;
                // return page;
            }
            return 'not found';
        },

        exports.getContentByContentTypeAndTag = async function (contentType, tag) {
            //TODO: add {"order":"data.sort ASC"},
            const filter = `{"where":{"and":[{"data.tags":{"regexp": "${tag}"}},{"data.contentType":"${contentType}"}]}}`;
            const encodedFilter = encodeURI(filter);
            let url = `${apiUrl}contents?filter=${encodedFilter}`;
            let pageRecord = await globalService.axiosInstance.get(url);
            if (pageRecord.data) {
                return pageRecord.data;
            }
            return 'not found';
        },

        exports.getContentByUrlAndContentType = async function (contentType, pageUrl) {
            const filter = `{"where":{"and":[{"url":"${pageUrl}"},{"data.contentType":"${contentType}"}]}}`;
            const encodedFilter = encodeURI(filter);
            let url = `${apiUrl}contents?filter=${encodedFilter}`;
            let pageRecord = await globalService.axiosInstance.get(url);
            if (pageRecord.data[0]) {
                return pageRecord;
                // await this.getPage(pageRecord.data[0].id, pageRecord.data[0]);
                // let page = pageRecord.data[0];
                // page.data.html = pageContent;
                // return page;
            }
            return 'not found';
        },

        exports.getContentById = async function (id) {
            let url = `${apiUrl}contents/${id}`;
            let content = await globalService.axiosInstance.get(url);
            return content.data;
        },

        exports.asyncForEach = async function (array, callback) {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        },

        exports.getImageUrl = function (img) {
            return `/api/containers/files/download/${img.originalName}`;
        },

        exports.getImage = function (img) {
            let url = this.getImageUrl(img);
            return `<img class="img-fluid rounded" src="${url}" />`;
        }


})(typeof exports === 'undefined' ? this['dataService'] = {} : exports);