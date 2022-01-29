const dataService = require('./data.service')

const fs = require('fs')
const axios = require('axios')
const ShortcodeTree = require('shortcode-tree').ShortcodeTree
const chalk = require('chalk')
const log = console.log

// var formio = require('formio-service')();
const Form = formio.Form

module.exports = {

  getComponents: async function (contentType) {
    // console.log('getting components');
    const form = new Form('https://examples.form.io/example')

    FormioUtils.eachComponent(form.components, (component) => {
      console.log(component)
      //   });
    })
  }

}
