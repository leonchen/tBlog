var config = require('../config');

var resources = {};
for (var k in config.site.resources) {
  resources[k] = require("../resources/"+k);
}

module.exports = function (app) {
  // homepage
  app.get("/", function(req, res){
    res.render('index', {});
  });

  app.get("/resources/:resource/topics/more", function (req, res) {
    resources[req.params.resource].getTopics(req, res, function (err, topics) {
      res.send(200, {error: err, topics: topics});
    });
  });

  app.get("/resources/:resource/topics/latest", function (req, res) {
    resources[req.params.resource].getTopics(req, res, function (err, topics) {
      res.send(200, {error: err, topics: topics});
    });
  });

  for (var k in resources) {
    if (resources[k].handle) resources[k].handle(app);
  }
}
