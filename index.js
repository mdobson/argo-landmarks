var argo = require('argo'),
    resource = require('argo-resource'),
    router = require('argo-url-router');

var Landmarks = require('./landmark');

argo()
  .use(router)
  .use(resource.of(Landmarks))
  .listen(process.env.PORT || 8000);
