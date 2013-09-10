var argo = require('argo'),
    resource = require('argo-resource'),
    router = require('argo-url-router');

var Landmarks = require('./landmark');
var key = "1d6fed5814a63657";

argo()
  .use(router)
  .use(resource.of(Landmarks))
  .map('^/forecast', function(server){
    server
      .use(function(handle){
        handle("request", function(env, next) {
          var reqUrl = env.request.url;
          var needle = "/forecast";
          var subbedUrl = reqUrl.substr(needle.length, reqUrl.length - needle.length);
          env.request.url = subbedUrl;
          next(env);
        });
        handle("response", function(env, next) {
          console.log(env.target.url);
          next(env);
        })
       })
      .target("http://api.wunderground.com/api/"+key+"/conditions/q");
  })
  .listen(process.env.PORT || 8000);
