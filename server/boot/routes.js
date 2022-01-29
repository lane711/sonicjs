// var loopback = require("loopback");
const emitterService = require('../services/emitter.service')
const globalService = require('../services/global.service')
const cacheService = require('../services/cache.service')
const urlService = require('../services/url.service')
urlService.startup()
const pageBuilderService = require('../services/page-builder.service')
const adminService = require('../services/admin.service')
const dataService = require('../services/data.service')
dataService.startup()
const moduleService = require('../services/module.service')
const formService = require('../services/form.service')
const menuService = require('../services/menu.service')
const mediaService = require('../services/media.service')
const siteSettingsService = require('../services/site-settings.service')
const themeSettingsService = require('../services/theme-settings.service')
const contentService = require('../services/content.service')
contentService.startup()
const cssService = require('../services/css.service')
cssService.startup()
const assetService = require('../services/asset.service')
const userService = require('../services/user.service')
const authService = require('../services/auth.service')
const dalService = require('../services/dal.service')
const backupService = require('../services/backup.service')
const backupRestoreService = require('../services/backup-restore.service')

const helperService = require('../services/helper.service')
const sharedService = require('../services/shared.service')
const breadcrumbsService = require('../services/breadcrumbs.service')
const mixPanelService = require('../modules/mixpanel/services/mixpanel-main-service')
const _ = require('underscore')
const ShortcodeTree = require('shortcode-tree').ShortcodeTree
const ShortcodeFormatter = require('shortcode-tree').ShortcodeFormatter

const path = require('path')
const cors = require('cors')
const chalk = require('chalk')
const log = console.log
const url = require('url')
const fileService = require('../services/file.service')
let pageLoadedCount = 0

const frontEndTheme = `${process.env.FRONT_END_THEME}`

exports.loadRoutes = async function (app) {
  authService.startup(app)
  adminService.startup(app)
  formService.startup(app)
  backupService.startup(app)
  backupRestoreService.startup(app)

  const page = ''
  const adminPage = '';

  (async () => {
    await dalService.startup(app)
    await cacheService.startup()
    await moduleService.startup(app)
    await menuService.startup()
    await mediaService.startup()
    await siteSettingsService.startup()
    await themeSettingsService.startup()
    await userService.startup(app)
    await assetService.startup()
    await pageBuilderService.startup(app)
    await pageBuilderService.startup(app)

    await emitterService.emit('startup', { app: app })

    // load catch-all last
    this.loadRoutesCatchAll(app)

    await emitterService.emit('started', { app: app })
  })()

  app.get('*', async function (req, res, next) {
    globalService.AccessToken = 'todo-access-token'

    if (req.session) {
      req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    }

    next()
  })

  app.get('/hbs', async function (req, res) {
    res.render('home')
  })

  app.get('/nested-forms-list*', async function (req, res) {
    const contentTypesRaw = await dataService.contentTypesGet()
    const contentTypes = contentTypesRaw.map(function (contentType) {
      return {
        _id: contentType.systemId,
        type: 'form',
        title: contentType.title
      }
    })
    const sorted = _.sortBy(contentTypes, 'title')

    res.send(sorted)
  })

  app.get('/form/*', async function (req, res) {
    const moduleSystemId = req.path.replace('/form/', '')
    const contentType = await dataService.contentTypeGet(
      moduleSystemId,
      req.sessionID
    )
    const form = await formService.getFormJson(contentType, req.sessionID)
    res.send(form)
  })

  app.get('/zsandbox', async function (req, res) {
    const data = {}
    res.render('sandbox', { layout: 'blank.handlebars', data: data })
  })

  app.get('/theme1', async function (req, res) {
    const data = {}
    res.render('sandbox', { layout: theme, data: data })
  })

  app.get('/theme2', async function (req, res) {
    const data = {}
    res.render('sandbox', { layout: 'theme2.handlebars', data: data })
  })

  app.get('/admin/sandbox', async function (req, res) {
    const data = {}
    res.render('sandbox', { layout: 'admin.handlebars', data: data })
  })

  app.get('/css/generated.css', async function (req, res) {
    res.set('Content-Type', 'text/css')
    const css = await cssService.getGeneratedCss()
    res.send(css)
  })

  app.post('/dropzone-upload', async function (req, res) {
    console.log('dropzone-upload req.files.file', req.files.file)
    await fileService.uploadWriteFile(req.files.file, req.sessionID)
    res.sendStatus(200)
  })

  app.post('/form-submission', async function (req, res) {
    const payload = req.body.data.data ? req.body.data.data : undefined

    if (payload) {
      const options = { data: payload, sessionID: req.sessionID }

      await emitterService.emit('afterFormSubmit', options)
    }

    res.sendStatus(200)
  })

  app.post('*', async function (req, res, next) {
    await emitterService.emit('postBegin', { req: req, res: res })

    if (!req.isRequestAlreadyHandled) {
      next()
    }
  })
}

exports.loadRoutesCatchAll = async function (app) {
  app.get(/^[^.]*$/, async function (req, res, next) {
    await emitterService.emit('requestBegin', { req: req, res: res })

    if (req.isRequestAlreadyHandled) {
      // modules can set the req.isRequestAlreadyHandled to true if they
      // have already fully handled the request including the response.
      return
    }

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

    // for modules css/js files
    if (
      (req.url.endsWith('.css') || req.url.endsWith('.js')) &&
      req.url.startsWith('/modules/')
    ) {
      const cssFile = path.join(__dirname, '..', req.url)
      // res.set('Content-Type', 'text/css');
      res.sendFile(cssFile)
      return
    }

    if (
      req.url.startsWith('/graphql') ||
      req.url.startsWith('/login') ||
      req.url.startsWith('/register') ||
      req.url.startsWith('/api') ||
      req.url.endsWith('.css') ||
      req.url.endsWith('.html') ||
      req.url.endsWith('.ico') ||
      req.url.endsWith('.map') ||
      req.url.endsWith('.jpg') ||
      req.url.endsWith('.png') ||
      req.url.endsWith('.svg') ||
      req.url.endsWith('.txt') ||
      req.url.endsWith('.js') ||
      req.url.indexOf('.js?') > -1 ||
      req.url.indexOf('fonts') > -1 ||
      req.url.indexOf('.woff') > -1
    ) {
      return next()
    }

    if (process.env.MODE == 'production') {
      console.log(`serving: ${req.url}`)
    }

    const isAuthenticated = await userService.isAuthenticated(req)
    globalService.setAreaMode(false, true, isAuthenticated)

    // lookup which module should handle this request
    // console.log("processing", req.url);
    const urlKey = await urlService.getUrl(req.url)
    // console.log("urlKey", urlKey);

    // replace this will

    let page = {}
    req.urlKey = urlKey
    const processUrlOptions = { req, res, urlKey, page }

    await emitterService.emit('processUrl', processUrlOptions)
    page = processUrlOptions.page

    // return;

    if (!page.data || page.data?.title === 'Not Found') {
      // res.render("404", page);
      res.render(`front-end/${frontEndTheme}/layouts/404`, {
        layout: `front-end/${frontEndTheme}/${frontEndTheme}`
      })

      return
    }

    await emitterService.emit('preRenderTemplate', (options = { page, req }))

    page.data.id = page.id
    page.data.sessionID = req.sessionID
    page.data.themeSettings.bootstrapToggleMiddle = page.data.themeSettings.bootstrapVersion == 4 ? '' : 'bs-'

    res.render(`front-end/${frontEndTheme}/layouts/main`, {
      layout: `front-end/${frontEndTheme}/${frontEndTheme}`,
      data: page.data
    })

    req.pageLoadedCount = pageLoadedCount
    if (pageLoadedCount < 1) {
      await emitterService.emit('firstPageLoaded', (options = { req }))
    }
    pageLoadedCount++

    await emitterService.emit('postPageRender', (options = { page, req }))
  })
}
