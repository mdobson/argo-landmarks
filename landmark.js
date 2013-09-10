var path = require('path');
var url = require('url');
var nano = require('nano')('http://mdobs.cloudant.com');
var landmarksDb = nano.db.use('landmarks');


var Landmarks = module.exports = function(landmarks) {
  this.landmarks = [];
  var self = this;
  landmarksDb.list(function(error, result) {
    if(!error) {
      result.rows.forEach(function(landmark) {
        self.landmarks.push(landmark);
      });
    }
  });
} 

Landmarks.prototype.init = function(config) {
  config
    .path('/landmarks')
    .get(this.list)
    .get('/{id}', this.show)
    .bind(this);
};

Landmarks.prototype.list = function(env, next) {
  env.response.body = this.landmarks;
  next(env);
};

Landmarks.prototype.show = function(env, next) {
  var key = env.request.params.id;

  landmarksDb.get(key, function(err, body) {
    if(!err) {
      env.response.body = body;
      next(env);
    }
  });
}
