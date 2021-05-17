const User = require("../schema/models/user");
const Content = require("../schema/models/content");
const Tag = require("../schema/models/tag");

var dataService = require("./data.service");

module.exports = dalService = {
  getUser: async function (id, user) {
    if (id === user.id) {
      return User.findById(id);
    }

    //admins can see all users
    //TODO: get role by name
    if (user.roles.includes("admin")) {
      return User.findById(id);
    }
  },

  getContents: async function (contentTypeId, url, data, tag, user) {
    let contents = [];

    if (contentTypeId) {
      contents = await Content.find({
        contentTypeId: contentTypeId,
      }).exec();
    } else if (url) {
      return Content.find({
        url: url,
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
      return Content.find({});
    }

    if (contents.length > 0) {
      contents = dalService.checkPermission(contents, user);
    }

    return contents;
  },

  //get content type so we can detect permissions
  checkPermission: async function (data, user) {
    let contentTypeId = data[0].contentTypeId;
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
        data.forEach(entity => {
          delete entity.data.email;
        });
      }
    }

    return data;
  },
};
