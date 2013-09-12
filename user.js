var ug = require("usergrid"),
    client = new ug.client({
      orgName:"mdobson",
      appName:"landmarks-app",
      logging:true
    });

var User = module.exports = function(){};

User.prototype.init = function(config) {
	config
		.path('/users')
		.post('/signup', this.signup)
		.get('/signin', this.signin)
		.post('/checkin', this.checkin)
		.get('/checkins/me', this.checkins)
		.get('/me',this.user)
		.bind(this);
};

User.prototype.signup = function(env, next) {
	env.request.getBody(function(err, body) {
    if(err) {
      env.response.statusCode = 400;
      env.response.body = {"meta":{"status":"error", "error":err}};
      next(env);
    } else {
    	var bodyObject = JSON.parse(body.toString())
    	var username = bodyObject.username;
    	var password = bodyObject.password;
    	var email = bodyObject.email;
    	var name = "";

    	client.signup(username, password, email, name, function(error, result){
    		if(error) {
          env.response.statusCode = 400;
          env.response.body = {"meta":{"result":"error", "error":result}};
          next(env);
        } else {
          env.response.body = {"meta":{"result":"success"}, "data":result};
          next(env);
        }
    	});
    }
  });
};

User.prototype.user = function(env, next) {
	var token = env.route.query.access_token;
	client.setToken(token);
	client.authType = "APP_USER";
	client.getLoggedInUser(function(error, data, user){
		if(error) {
	    env.response.statusCode = 400;
	    env.response.body = {"meta":{"result":"error", "error":data}};
	    next(env);
	  } else {
	    env.response.body = {"meta":{"result":"success"}, "data":user.get()};
	    next(env);
	  }
	});
};

User.prototype.signin = function(env, next) {
 	var username = env.route.query.username;
	var password = env.route.query.password;
	var name = "";

	client.login(username, password, function(error, result){
		if(error) {
      env.response.statusCode = 400;
      env.response.body = {"meta":{"result":"error", "error":result}};
      next(env);
    } else {
      env.response.body = {"meta":{"result":"success"}, "data":{"token":result.access_token}};
      next(env);
    }
	});
};

User.prototype.checkins = function(env, next) {
	var self = this;
	var token = env.route.query.access_token;
	client.setToken(token);
	client.authType = "APP_USER";
	client.getLoggedInUser(function(err, data, user){
		if(err) {
      env.response.statusCode = 400;
      env.response.body = {"meta":{"result":"error", "error":result}};
      next(env);
    } else {
			user.getConnections("checkedin", function(err, data, entities){
				if(err) {
		      env.response.statusCode = 400;
		      env.response.body = {"meta":{"result":"error", "error":result}};
		      next(env);
		    } else {
		    	env.response.body = {"meta":{"result":"success"}, "data":entities};
      		next(env);
		    }
			});
		}
	});
};

User.prototype.checkin = function(env, next) {
	var self = this;
	var token = env.route.query.access_token;
	client.setToken(token);
	client.authType = "APP_USER";
	var checkins = new ug.collection({"client":client, "type":"checkins"});
  env.request.getBody(function(err, body) {
    if(err) {
      env.response.statusCode = 400;
      env.response.body = {"meta":{"status":"error", "error":err}};
      next(env);
    } else {
      var reqBody = JSON.parse(body.toString());
      var entity = {
        "type":"checkins",
        "landmark_name":reqBody.landmark_name,
        "location":reqBody.location
      };
      checkins.addEntity(entity, function(error, checkin) {
        if(error) {
          env.response.statusCode = 400;
          env.response.body = {"meta":{"result":"error", "error":checkin}};
          next(env);
        } else {
          client.getLoggedInUser(function(err, data, user){
          	if(error) {
		          env.response.statusCode = 400;
		          env.response.body = {"meta":{"result":"error", "error":data}};
		          next(env);
		        } else {
		        	user.connect("checkedin", checkin, function(err, response){
			        	if(error) {
				          env.response.statusCode = 400;
				          env.response.body = {"meta":{"result":"error", "error":response}};
				          next(env);
				        } else {
				        	env.response.body = {
				        		"meta":{
				        			"status":"success"
				        		},
				        		"data": response
				        	};
				        	next(env);
				        }		
		        	});
		        }	
          });
        }
      });
    }
  });
};