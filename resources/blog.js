var Blog = function () {
};

Blog.prototype = {
  handle: function (app) {
  },

  getTopics: function (req, res, cb) {
    this.getMoreTopics(req, res, cb);
  },

  getMoreTopics: function (req, res, cb) {
    var timestamp = parseInt(req.query.timestamp) || (new Date()).getTime();
    var per = parseInt(req.query.per) || 20;
    var topics = [];

    for (var i=0;i<5;i++){
      topics.push({
        timestamp: timestamp - 2000,
        title: 'blog@'+timestamp,
        content: 'blog content'
      });
    }

    cb(null, topics); 
  },

  getLatestTopics: function (req, res, cb) {
    var timestamp = parseInt(req.query.timestamp);
    var topics = [];
    for (var i=0;i<10;i++){
      topics.push({
        timestamp: timestamp + 20000,
        title: 'blog@'+timestamp,
        content: 'blog content'
      });
    }

    cb(null, topics); 
  }

};

module.exports = new Blog();
