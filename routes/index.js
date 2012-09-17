var topics = require('./topics');
var weibo = require("../resources/weibo");

module.exports = function (app) {
  // homepage
  app.get("/", function(req, res){
    res.render('index', {});
  });

  app.get("/topics/more", function (req, res) {
    weibo.getTopics(req, function (topics) {
      res.send(200, topics);
    });
    //res.send(200, topics.getMoreTopics(req));
  });
  app.get("/topics/latest", function (req, res) {
    res.send(200, weibo.getTopics(req));
    //res.send(200, topics.getLatestTopics(req));
  });

  weibo.handle(app);
}
