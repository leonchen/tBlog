var topics = require('./topics');

module.exports = function (app) {
  // homepage
  app.get("/", function(req, res){
    res.render('index', {});
  });

  app.get("/topics/more", function (req, res) {
    res.send(200, topics.getMoreTopics(req));
  });
  app.get("/topics/latest", function (req, res) {
    res.send(200, topics.getLatestTopics(req));
  });
}
