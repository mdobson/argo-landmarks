module.exports = function(handle){
	handle("request", function(env, next) {
		var reqUrl = env.request.url;
		var needle = "/forecast";
		var subbedUrl = reqUrl.substr(needle.length, reqUrl.length - needle.length);
		env.request.url = subbedUrl;
		next(env);
	});
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