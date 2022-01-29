const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')
const cryptoService = require('../../../services/crypto.service')
const sendEmail = process.env.SEND_EMAIL

module.exports = newsletterMainService = {
  startup: async function (app) {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name === 'NEWSLETTER') {
        options.moduleName = 'newsletter'
        await moduleService.processModuleInColumn(options)
      }
    })

    emitterService.on('afterFormSubmit', async function (options) {
      if (options.data.contentType !== 'newsletter') {
        return
      }

      const encryptedEmail = cryptoService.encrypt(options.email)

      // let testDecrypt = cryptoService.decrypt(encryptedEmail);

      const payload = {
        data: {
          contentType: options.contentType,
          email: encryptedEmail
        }
      }

      // save the form
      await dataService.contentCreate(payload)

      if (sendEmail === 'TRUE') {
        // send the emails

        // confirmation to user
        const body = 'Hi Fellow Patriot, \n\nThanks for signing up for our mailing list. We\'ll be in touch soon!'
        await emailService.sendEmail(
          'admin@ocunite.org',
          'Test 234',
          options.email,
          'Newsletter SignUp Confirmed',
          body
        )

        // admin notification
        const adminBody = `${options.email}`
        await emailService.sendEmail(
          options.email,
          'Test 234',
          'admin@ocunite.org',
          'OCUnite Newsletter SignUp',
          adminBody
        )
      }
    })
  }
}
