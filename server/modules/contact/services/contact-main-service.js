var dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')
const formService = require('../../../services/form.service')
var dataService = require('../../../services/data.service')
const emailService = require('../../../services/email.service')
const viewService = require('../../../services/view.service')

module.exports = contactUsMainService = {
  startup: async function () {
    emitterService.on('beginProcessModuleShortCode', async function (options) {
      if (options.shortcode.name !== 'CONTACT') {
        return
      }

      options.moduleName = 'contact'
      await moduleService.processModuleInColumn(options)
    })

    emitterService.on('postModuleGetData', async function (options) {
      if (options.shortcode.name !== 'CONTACT') {
        return
      }

      const contactFormSettingsId = options.shortcode.properties.id

      options.viewModel.data.form = await formService.getForm(
        'contact',
        undefined,
        'submitForm(submission)',
        false,
        contactFormSettingsId,
        options.req.sessionID
      )

      // console.log('contact module after view model', options.viewModel);
    })

    emitterService.on('afterFormSubmit', async function (options) {
      if (options.data.contentType !== 'contact') {
        return
      }

      const formSettings = await dataService.getContentById(options.data.formSettingsId)

      // save the form
      await dataService.contentCreate(options)

      // send the emails
      const contact = options.data

      // confirmation to user
      // let body = `Hi ${contact.name}, \n\nThanks for reaching out. We'll get back to you ASAP.\n\nFor your reference, here was your message:\n${contact.message}`;
      const body = viewService.processTemplateString(formSettings.data.emailMessageBody, { contact })

      await emailService.sendEmail(
        formSettings.data.adminEmail,
        formSettings.data.fromName,
        contact.email,
        formSettings.data.emailMessageSubject,
        body
      )

      // admin notification
      const adminBody = `${contact.name} (${contact.email}) wrote: \n\n${contact.message}`
      await emailService.sendEmail(
        contact.email,
        formSettings.data.fromName,
        formSettings.data.adminEmail,
        formSettings.data.emailMessageSubjectAdmin,
        adminBody
      )
    })
  }
}
