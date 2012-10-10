var config = require('../config');

var resources = {};
for (var k in config.site.resources) {
  resources[k] = require("../resources/"+k);
}

module.exports = function (app) {
  // homepage
  app.get("/", function(req, res){
    res.render('index', {source: req.query.source});
  });

  app.get("/test", function(req, res){
    res.send(200, "app is up");
  });

  app.get("/resources/:resource/topics/more", function (req, res) {
    req.topicParams = {
      max_id: (req.query.timestamp == 0 ? 0 : req.query.timestamp - 1),
      count: req.query.per
    };
    resources[req.params.resource].getTopics(req, res, function (err, topics) {
      res.send(200, {error: err, topics: topics});
    });
  });

  app.get("/resources/:resource/topics/latest", function (req, res) {
    req.topicParams = {
      since_id: req.query.timestamp
    };
    resources[req.params.resource].getTopics(req, res, function (err, topics) {
      res.send(200, {error: err, topics: topics});
    });
  });

  for (var k in resources) {
    if (resources[k].handle) resources[k].handle(app);
  }
}
