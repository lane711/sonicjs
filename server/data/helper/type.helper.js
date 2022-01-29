module.exports = typeHelper = {
  getDateTime: function () {
    const database = typeHelper.getDatabase()
    if (database.toLowerCase() == 'postgres') {
      return 'timestamp'
    }

    return 'datetime'
  },

  getDatabase: function () {
    return process.env.TYPEORM_CONNECTION
  }
}
