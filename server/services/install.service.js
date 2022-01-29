const dalService = require('./dal.service')
const dataService = require('./data.service')

const helperService = require('./helper.service')
const fileService = require('./file.service')
const logSymbols = require('log-symbols')

module.exports = installService = {
  checkInstallation: async function () {
    if (process.env.BYPASS_INSTALL_CHECK === 'TRUE') {
      return
    }

    console.log(logSymbols.info, 'Checking Install...')

    await installService.checkDefaultContent()

    console.log(logSymbols.success, 'Install Verified!')
  },

  checkDefaultContent: async function (app) {
    console.log(logSymbols.info, 'Checking Base Content...')

    const session = { user: { id: '69413190-833b-4318-ae46-219d690260a9' } }

    const siteSettingsColors = await dataService.getContentByType(
      'site-settings-colors'
    )
    if (!siteSettingsColors || siteSettingsColors.length === 0) {
      const data = {
        contentType: 'site-settings-colors',
        url: '/site-settings-colors',
        bodyBackground: '#F8F8F8',
        headerBackground: '#000',
        headerOpacity: '.95',
        background: 'green',
        header: '#555555',
        submit: true
      }
      const record = await dalService.contentUpdate(
        '',
        '/site-settings-colors',
        data,
        session
      )

      console.log('created siteSettingsColors:', record)
    }

    const siteSettings = await dataService.getContentByType('site-settings')
    if (siteSettings.length === 0) {
      const data = {
        contentType: 'site-settings',
        url: '/site-settings',
        logoType: 'text',
        logoTitle: 'My Site',
        fontDefault: 'Lato',
        fontHeaders: 'Roboto',
        homePageId: '1'
      }
      const record = await dalService.contentUpdate(
        '',
        '/site-settings',
        data,
        session
      )
      console.log('created siteSettings:', record)
    }

    const themeSettings = await dataService.getContentByType('theme-settings')
    if (themeSettings.length === 0) {
      const data = {
        contentType: 'theme-settings',
        url: '/theme-settings',
        logoType: 'image',
        logoTitle: 'Acme Widgets',
        fontSize: '24px',
        fontColor: '#fff',
        fileName: 'temp-logo.png',
        imageWidth: '120px',
        imageStyle: ''
      }
      const record = await dalService.contentUpdate(
        '',
        '/theme-settings',
        data,
        session
      )
      console.log('created themeSettings:', record)
    }

    const googleAnalytics = await dataService.getContentByType('google-analytics')
    if (googleAnalytics.length === 0) {
      const data = {
        contentType: 'google-analytics',
        url: '/google-analytics',
        googleAnalyticsUACode: 'UA-132867068-1',
        enableOnDomain: 'sonicjs.com'
      }
      const record = await dalService.contentUpdate(
        '',
        '/google-analytics',
        data,
        session
      )
      console.log('created googleAnalytics:', record)
    }

    // let mainMenu = await dataService.getContentByType("menu");
    const mainMenu = await menuService.getMenu('Main')
    if (!mainMenu) {
      const data = {
        contentType: 'main-menu',
        url: '/main-menu',
        title: 'Main',
        contentType: 'menu',
        links: [
          {
            id: 'NQ6YeBCClIQ',
            text: 'Home',
            icon: 'fa fa-chevron-right',
            li_attr: {
              id: 'NQ6YeBCClIQ'
            },
            a_attr: {
              href: '#',
              id: 'NQ6YeBCClIQ_anchor'
            },
            state: {
              loaded: true,
              opened: false,
              selected: true,
              disabled: false
            },
            data: {
              id: 'NQ6YeBCClIQ',
              title: 'Home',
              url: '/',
              showInMenu: true,
              showChildren: false
            },
            children: [

            ],
            type: 'default'
          }
        ]
      }
      const record = await dalService.contentUpdate(
        '',
        '/main-menu',
        data,
        session
      )
      console.log('created main menu:', record)
    }

    const page = await dataService.getContentByType('page')
    if (page.length === 0) {
      const data = {
        contentType: 'page',
        url: '/',
        title: 'Home',
        showHero: false,
        heroTitle: '',
        pageCssClass: '',
        autoGenerateUrl: false
      }
      const record = await dalService.contentUpdate(
        '',
        '/',
        data,
        session
      )
      console.log('created default page:', record)
    }

    console.log(logSymbols.success, 'Base Content Verified!')
  }
}
