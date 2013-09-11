//This is an example of a proxy based resource.
//  Sometimes over the course of building an API you'll want to use another API
//  in your backend systems.
var Forecast = module.exports = function(proxyUrl) {
	var key = "1d6fed5814a63657";
	this.proxyUrl = proxyUrl || "http://api.wunderground.com/api/"+key+"/conditions/q";
}

//We use the init() function to wire up routes and actions associated with routes.
//*path()* is used to set the overall endpoint of the resource
//  Http method functions can take an additional path 
//  that will be added to the end of the overall path.

Forecast.prototype.init = function(config) {
	config
		.path('/forecast/{state}/{city}.json')
		.get(this.forecast)
		.bind(this);
}

//Here is a method that doesn't represent an actual pipe for an action.
//  The *forecast()* function uses a middleware to manipulate the request and response pipelines.

Forecast.prototype.forecast = function(handle) {
	var self = this;

	//This is the request pipeline.
	//This sets up the request to be proxied to another server.
	//Simply set env.target.url to get this behavior.
	handle("request", function(env, next) {
		var reqUrl = env.request.url;
		var needle = "/forecast";
		var subbedUrl = reqUrl.substr(needle.length, reqUrl.length - needle.length);
		env.target.url = self.proxyUrl + subbedUrl;
		next(env);
	});

	//This is the response pipeline
	//Here we alter the full response body given to us by the proxy API,
	//and we scrub it to only return the relevant data we want.
	handle("response", function(env, next){
		env.target.response.getBody(function(error, response){
			if(error) {
				env.target.response.body = {"meta":{"status":"error", "error":error}};
				next(env);
			} else {
				var respBody = JSON.parse(response.toString());
				var responseBody = {
					"meta":{
						"status":"success",
						"attribution":respBody.response
					},
					"data":{
						"city":respBody.current_observation.display_location.city,
						"state":respBody.current_observation.display_location.state,
						"location":{
							"latitude":respBody.current_observation.display_location.latitude,
							"longitude":respBody.current_observation.display_location.longitude
						},
						"weather":{
							"weather": respBody.current_observation.weather,
							"temperature_string":respBody.current_observation.temperature_string,
							"temp_f": respBody.current_observation.temp_f,
							"temp_c": respBody.current_observation.temp_c,
							"relative_humidity": respBody.current_observation.relative_humidity,
							"wind_string": respBody.current_observation.wind_string
						}
					}
				};
				env.response.body = responseBody;
				next(env);
			}
		});
	})
}