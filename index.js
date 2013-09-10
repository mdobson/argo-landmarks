var argo = require('argo'),
    resource = require('argo-resource'),
    router = require('argo-url-router');

var Landmarks = require('./landmark');
var Checkins = require('./checkin');
var Forecast = require('./forecast');
var key = "1d6fed5814a63657";

argo()
  .use(router)
  .use(resource.of(Landmarks))
  .use(resource.of(Checkins))
  .map('^/forecast', function(server){
    server
      .use(Forecast)
      .target("http://api.wunderground.com/api/"+key+"/conditions/q");
  })
  .listen(process.env.PORT || 8000);
