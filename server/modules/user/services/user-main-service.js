const { User } = require('../../../data/model/User')
const dalService = require('../../../services/dal.service')
const dataService = require('../../../services/data.service')
const emitterService = require('../../../services/emitter.service')
const globalService = require('../../../services/global.service')
const userService = require('../../../services/user.service')

module.exports = userMainService = {
  startup: async function () {
    emitterService.on('afterFormSubmit', async function (options) {
      if (options.data && options.data.contentType === 'user-register') {
        await userService.registerUser(options.data.email, options.data.password)
      }

      if (options.data && options.data.contentType === 'user') {
        const user = {}
        user.id = options.data.id
        user.username = options.data.email
        user.password = options.data.password
        user.profile = options.data

        await dalService.userUpdate(user, options.sessionID)
      }

      //   id: {
      //     primary: true,
      //     type: "int",
      //     generated: true
      // },
      // username: {
      //     type: "varchar",
      //     unique:true,
      // },
      // salt: {
      //     type: "varchar"
      // },
      // hash: {
      //     type: "varchar"
      // },
      // profile: {
      //     type: "text"
      // },
      // createdOn: {
      //     type: "datetime"
      // },
      // updatedOn: {
      //     type: "datetime"
      // },
    })
  }

}
