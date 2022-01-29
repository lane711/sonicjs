const dataService = require('./data.service')
const helperService = require('./helper.service')
const emitterService = require('./emitter.service')

const fs = require('fs')
const axios = require('axios')
const ShortcodeTree = require('shortcode-tree').ShortcodeTree
const chalk = require('chalk')
const log = console.log
const path = require('path')
const sendgrid = require('sendgrid').mail

module.exports = emailService = {
  sendEmail: async function (from, fromName, to, subject, body) {
    // convert to html
    body = body.replace(/(?:\r\n|\r|\n)/g, '<br>')

    const from_email = new sendgrid.Email(from)
    from_email.name = fromName
    const to_email = new sendgrid.Email(to)
    const content = new sendgrid.Content('text/html', body)
    const mail = new sendgrid.Mail(from_email, subject, to_email, content)

    if (!process.env.SENDGRID_API_KEY) {
      throw 'SENDGRID_API_KEY not set!'
    }

    const sg = require('sendgrid')(process.env.SENDGRID_API_KEY)
    const request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    })

    sg.API(request, function (error, response) {
      if (error) {
        console.log(error)
      }
      console.log(response.statusCode)
      console.log(response.body)
      console.log(response.headers)
    })
  }
}
