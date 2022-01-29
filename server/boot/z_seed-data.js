const fs = require('fs')
const { parse, stringify } = require('envfile')
const path = require('path')

module.exports = async function (app) {
  if (!(process.env.RUN_NEW_SITE_MIGRATION === 'TRUE')) {
    return
  }

  if (app.dataSources.primary.connector.name === 'memory') {
    return
  }

  console.log('Info: running seed-data.js to seed database.')

  const dataRaw = fs.readFileSync('server/data/data.json')
  const data = JSON.parse(dataRaw)

  console.log('>>>>>>automigrate start')

  migrateContentTypes(app)
  migrateContent(app)

  app.dataSources.primary.automigrate('AccessToken')
  app.dataSources.primary.automigrate('ACL')
  app.dataSources.primary.automigrate('Role')
  app.dataSources.primary.automigrate('RoleMapping')
  app.dataSources.primary.automigrate('User')

  console.log('>>>>automigrate end')

  function migrateContentTypes (app) {
    app.dataSources.primary.automigrate('contentType', function (err) {
      if (err) throw err

      const contentTypeObjs = data.models.contentType

      const contentTypes = Object.keys(contentTypeObjs).map((key) => [
        Number(key),
        contentTypeObjs[key]
      ])

      contentTypes.forEach((contentType) => {
        console.log(contentType)
        const objString = contentType[1]
        const obj = JSON.parse(objString)

        console.log(obj)

        const newContentType = {
          title: obj.title,
          systemId: obj.systemId,
          data: obj.data
        }

        app.models.contentType.create(newContentType, function (
          err,
          newInstance
        ) {
          if (err) throw err
          console.log('Content type created:', newInstance)

          if (newContentType.systemId === 'asset') {
            setEnvVarToEnsureMigrationDoesNotRunAgain()
          }
        })
      })
    })
  }

  function migrateContent (app) {
    app.dataSources.primary.automigrate('content', function (err) {
      if (err) throw err

      const contentObjs = data.models.content

      const contents = Object.keys(contentObjs).map((key) => [
        Number(key),
        contentObjs[key]
      ])

      contents.forEach((content) => {
        console.log(content)
        const objString = content[1]
        const obj = JSON.parse(objString)

        const newContent = {
          data: obj.data
        }

        app.models.content.create(newContent, function (err, newInstance) {
          if (err) throw err
          console.log('Content created:', newInstance)
          setEnvVarToEnsureMigrationDoesNotRunAgain()
          console.log('Success! Initial data migration complete.')
        })
      })
    })
  }

  async function setEnvVarToEnsureMigrationDoesNotRunAgain () {
    const sourcePath = path.join(__dirname, '../..', '.env')

    fs.readFile(sourcePath, 'utf8', function (err, data) {
      if (err) {
        return console.log(err)
      }
      const parsedFile = parse(data)
      parsedFile.RUN_NEW_SITE_MIGRATION = 'FALSE'
      fs.writeFileSync(sourcePath, stringify(parsedFile))
    })
  }
}
