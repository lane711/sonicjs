const User = require("../schema/models/user");
// const Content = require("../schema/models/content");
const Tag = require("../schema/models/tag");

var dataService = require("./data.service");

const { getRepository } = require("typeorm");
const { Post } = require("../data/model/Post");
const { Content } = require("../data/model/Content");

module.exports = dalService = {
  startup: async function (app) {
    app.get("/typeorm", async function (req, res) {
      // const users = await userRepository.find();
      res.json(await dalService.test());
    });
  },

  userGet: async function (id, user) {
    if (id === user.id) {
      return User.findById(id);
    }

    //admins can see all users
    //TODO: get role by name
    if (user.roles.includes("admin")) {
      return User.findById(id);
    }
  },

  contentGet: async function (
    id,
    contentTypeId,
    url,
    data,
    tag,
    user,
    returnAsArray = false
  ) {
    let contents = [];
    const contentRepo = await getRepository(Content);

    if (id) {
      let content = await contentRepo.findOne({ where: { id: id } });
      dalService.processContent(content);

      if (returnAsArray) {
        contents.push(content);
        return contents;
      }
      return content;
    } else if (url) {
      let content = await contentRepo.findOne({ where: { url: url } });
      dalService.processContent(content);
      return content;
    } else if (contentTypeId) {
      contents = await contentRepo.find({
        where: { contentTypeId: contentTypeId },
      });
    } else if (data) {
      var query = {};
      query["data." + data.attr] = data.val;
      console.log("query", query);
      return Content.find(query);
    } else if (tag) {
      let contentsQuery = Tag.findById(tag); //.populate("contents");
      contents = contentsQuery.exec();
      console.log(contents);
      return contents;
    } else {
      contents = await contentRepo.find();
    }

    dalService.processContents(contents);
    return contents;
  },

  contentUpdate: async function (id, url, data) {
    const contentRepo = await getRepository(Content);
    let content = await contentRepo.findOne({ where: { id: id } });
    content.url = url;
    content.data = JSON.stringify(data);
    return contentRepo.save(content);
  },

  processContent: function (content, user) {
    try {
      content.data = JSON.parse(content.data);
    } catch (err) {
      console.log(
        `JSON parsing error, id: ${content.id}, ${content.contentTypeId}`,
        err
      );
    }
    content = dalService.checkPermission(content, user);
  },

  processContents: function (contents, user) {
    contents.forEach((content) => {
      dalService.processContent(content, user);
    });
  },

  //get content type so we can detect permissions
  checkPermission: async function (data, user) {
    let contentTypeId = data.contentTypeId ?? data[0].contentTypeId;
    let contentType = await moduleService.getModuleContentType(contentTypeId);

    if (user && user.roles.includes("admin")) {
      return data;
    }

    if (contentType.permissions) {
      let view = contentType.permissions.mappings.find(
        (x) => (x = "view")
      ).view;
      if (view === "admin") {
        data = [];
      }
      if (view === "filtered") {
        //remove sensative fields like email, address
        data.forEach((entity) => {
          delete entity.data.email;
        });
      }
    }

    return data;
  },
};
