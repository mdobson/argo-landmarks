var ug = require("usergrid"),
    client = new ug.client({
      orgName:"mdobson",
      appName:"landmarks-app",
      logging:true
    });

var Checkins = module.exports = function(checkins) {
  //Get usergrid checkins by most recently created
  var checkins = new ug.collection({"client":client, "type":"checkins", "qs":{"ql":"order by created desc"}});
  var self = this;
  checkins.fetch(function(error, response) {
    if(error){
      self.checkins = [];
    } else {
      self.checkins = [];
      while(checkins.hasNextEntity()) {
        var checkin = checkins.getNextEntity();
        self.checkins.push(checkin.get());
      }
    }
  });
};

Checkins.prototype.init = function(config) {
  config
    .path('/checkins')
    .get(this.list)
    .get('/{id}',this.show)
    .bind(this);
};

Checkins.prototype.list = function(env, next) {
  env.response.body = {"meta":{"result":"success"}, "data":this.checkins};
  next(env);
};

Checkins.prototype.show = function(env, next) {
  client.getEntity(env.request.params.id, function(error, response) {
    if(error) {
      env.response.statusCode = 400;
      env.response.body = { "meta":{"status":"error", "error":response}};
      next(env);
    } else {
      env.response.body = { "meta":{"status":"success"}, "data":response};
      next(env);
    }
  });
};
