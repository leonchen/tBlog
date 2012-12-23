var config = require('../config');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(config.site.name.replace(" ", "_")+".blogDB");
var postSecret = config.site.resources.blog.postSecret;

var Blog = function () {
  this.initDB();
};


Blog.prototype = {
  initDB: function () {
    db.run("CREATE TABLE IF NOT EXISTS blog_topics (timestamp INTEGER, title TEXT, content TEXT)");
  },

  handle: function (app) {
    var self = this;
    app.all("/post", function (req, res) {
      if (req.body && req.body.secret == postSecret) {
        self.addTopic(req.body, function () {
          res.redirect("/?source=blog");
        });
      } else {
        res.render('post');
      }
    });
  },

  addTopic: function (params, cb) {
    var title = params.title || 'No Subject';
    var content = params.content || 'No Content';
    db.run("insert into blog_topics(timestamp, title, content) values(?, ?, ?)", [Date.now(), title, content], function (err) { cb(); });
  },

  getTopics: function (req, res, cb) {
    if ("max_id" in req.topicParams) {
      this.getMoreTopics(req, res, cb);
    } else {
      this.getLatestTopics(req, res, cb);
    }
  },

  getMoreTopics: function (req, res, cb) {
    var timestamp = parseInt(req.topicParams.max_id) || Date.now();
    var per = parseInt(req.topicParams.count) || 20;
    db.all("select * from blog_topics where timestamp <= ? limit ?", [timestamp, per], function (err, rows) { 
      cb(err, rows); 
    });
  },

  getLatestTopics: function (req, res, cb) {
    var timestamp = parseInt(req.topicParams.since_id);
    db.all("select * from blog_topics where timestamp > ?", [timestamp], function (err, rows) { 
      cb(err, rows); 
    });
  }

};

module.exports = new Blog();
