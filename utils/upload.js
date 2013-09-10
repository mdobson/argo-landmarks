var nano = require("nano")("http://mdobs.cloudant.com");

var landmarks = nano.db.use("landmarks");

var lmarksjson = require("./landmarks.json");

lmarksjson.forEach(function(landmark){
  landmarks.insert(landmark, landmark.landmark_name, function(err, body) {
    if(err) {
      console.log(err);
    } else {
      console.log("good");
    }
  });
});

