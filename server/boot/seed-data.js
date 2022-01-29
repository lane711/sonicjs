const fs = require('fs')
const { parse, stringify } = require('envfile')
const path = require('path')
const Content = require('../schema/models/content')

const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/sonicjs', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.connection.once('open', () => {
  console.log('conneted to database')

  console.log('Info: running seed-data.js to seed database.')

  const dataRaw = fs.readFileSync('server/data/data.json')
  const data = JSON.parse(dataRaw)

  // console.log(data);
  // migrateContentTypes(app);
  migrateContent(data)
})

async function migrateContent (data) {
  const contentObjs = data.models.content

  const contents = Object.keys(contentObjs).map((key) => [
    Number(key),
    contentObjs[key]
  ])

  contents.forEach((contentData) => {
    console.log(contentData)
    const objString = contentData[1]
    const obj = JSON.parse(objString)

    const newContent = {
      data: obj.data
    }

    console.log(newContent)

    const url = newContent.data.url ?? slugify(newContent.data.title) ?? slugify(newContent.data.contentType)
    console.log('url -->', url)

    // insert to db
    const content = new Content({
      contentTypeId: newContent.data.contentType,
      data: newContent.data,
      createdByUserId: -1,
      lastUpdatedByUserId: -1,
      url: url,
      createdOn: new Date(),
      updatedOn: new Date()
    })

    delete content.data.contentType

    try {
      content.save()
    } catch (error) {
      console.log(err)
    }

    // app.models.content.create(newContent, function (err, newInstance) {
    //   if (err) throw err;
    //   console.log("Content created:", newInstance);
    //   setEnvVarToEnsureMigrationDoesNotRunAgain();
    //   console.log("Success! Initial data migration complete.");
    // });
  })
}

function slugify (text) {
  // console.log('slug', text);
  if (!text) {
    return undefined
  }

  const slug = text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')

  return '/' + slug
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
// };
