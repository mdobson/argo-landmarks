//General checkin module. Gets all checkins without user association.
//Here we initialize any outside modules
var ug = require("usergrid"),
    client = new ug.client({
      orgName:"mdobson",
      appName:"landmarks-app",
      logging:true
    });

//This is the exported constructor needed to define a resource on our server file.
var Checkins = module.exports = function(checkins) {
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

//We use the init() function to wire up routes and actions associated with routes.
//*path()* is used to set the overall endpoint of the resource
//  Http method functions can take an additional path 
//  that will be added to the end of the overall path.

Checkins.prototype.init = function(config) {
  config
    .path('/checkins')
    .get(this.list)
    .get('/{id}',this.show)
    .bind(this);
};

//Below is implemented functionality for each route.

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
