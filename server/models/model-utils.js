exports.clearBaseACLs = function (ModelType, ModelConfig) {
  // console.log('user acls:', ModelType.settings.acls.length);
  ModelType.settings.acls.length = 0;
  ModelConfig.acls.forEach(function (r) {
    ModelType.settings.acls.push(r);
  });
  // console.log('user acls after:', ModelType.settings.acls.length);

};
