const fileService = require('./file.service')

const handlebars = require('handlebars')

module.exports = viewService = {
  getProcessedView: function (contentType, viewModel, viewPath) {
    const source = viewService.getHandlebarsTemplateForContentType(
      contentType,
      viewPath
    )

    const result = viewService.processTemplateString(source, viewModel)

    return result
  },

  processTemplateString: function (template, viewModel) {
    const templateView = handlebars.compile(template)

    const result = templateView(viewModel)

    return result
  },

  getHandlebarsTemplateForContentType: function (contentType, viewPath) {
    const file = fileService.getFileSync(viewPath)
    return file
  }
}
