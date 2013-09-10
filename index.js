var argo = require('argo'),
    resource = require('argo-resource'),
    router = require('argo-url-router');

var Landmarks = require('./landmark');
var Checkins = require('./checkin');
var Forecast = require('./forecast');

argo()
  .use(router)
  .use(resource.of(Landmarks))
  .use(resource.of(Checkins))
  .use(resource.of(Forecast))
  .listen(process.env.PORT || 8000);
