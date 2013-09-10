var argo = require('argo'),
    resource = require('argo-resource'),
    router = require('argo-url-router');

var Landmarks = require('./landmark');
var Checkins = require('./checkin');
var Forecast = require('./forecast');
var User = require('./user');

argo()
  .use(router)
  .use(resource.of(Landmarks))
  .use(resource.of(Checkins))
  .use(resource.of(Forecast))
  .use(resource.of(User))
  .listen(process.env.PORT || 8000);
