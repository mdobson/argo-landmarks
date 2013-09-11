var path = require('path');
var url = require('url');
var nano = require('nano')('http://mdobs.cloudant.com');
var landmarksDb = nano.db.use('landmarks');


var Landmarks = module.exports = function(landmarks) {
  this.landmarks = [];
  var key = "1d6fed5814a63657";
  this.wunderground_endpoint = "http://api.wunderground.com/api/"+key+"/conditions/q";
  var self = this;
  landmarksDb.list(function(error, result) {
    if(!error) {
      result.rows.forEach(function(landmark) {
        landmarksDb.get(landmark.key, function(err, body) {
          if(!err) {
            var city = null;
            if (body.city.indexOf(" ")!== -1) {
              city = body.city.replace(/ /g,"_");
            } else {
              city = body.city;
            }

            body.wunderground_forecast = self.wunderground_endpoint + '/' + body.wunderground_modifier + '/' + city +'.json';
            self.landmarks.push(body);
          }
        });
      });
    }
  });
} 

Landmarks.prototype.init = function(config) {
  config
    .path('/landmarks')
    .get(this.list)
    .get('/{id}', this.show)
    .post(this.insert)
    .bind(this);
};

Landmarks.prototype.list = function(env, next) {
  env.response.body = {"meta":{"status":"success"}, "data":this.landmarks};
  next(env);
};

Landmarks.prototype.show = function(env, next) {
  var key = env.request.params.id;

  landmarksDb.get(key, function(err, body) {
    if(!err) {
      env.response.body = {"meta":{"status":"success"}, "data":body};;
      next(env);
    }
  });
};

Landmarks.prototype.insert = function(env, next) {
  var self = this;
  env.request.getBody(function(err, body){
    var postBody = JSON.parse(body.toString());
    var name = null;
    if(!postBody.name) {
      name = postBody.landmark_name;
    } else {
      name = postBody.name;
    }

    landmarksDb.insert(postBody, name, function(error, result) {
      if(error){
        env.response.statusCode = 400;
        env.response.body = { "meta":{"status":"error", "result":error}};
      } else {
        env.response.body = { "meta":{"status":"success"}, "data":result};
      }
    });
  });
}
