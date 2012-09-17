var config = require("../config").resources.weibo;

var APP_KEY = config.APP_KEY;
var APP_SECRET = config.APP_SECRET;
var OAuth2 = require('oauth').OAuth2;
var http = require('http');
var qs = require('querystring');

var oauth = new OAuth2(APP_KEY, APP_SECRET, 'https://api.weibo.com', '/oauth2/authorize', '/oauth2/access_token');
var authRedirectURI = '/resources/weibo/authorize';
var deauthRedirectURI = '/resources/weibo/deauthorize';


var Weibo = function () {
}

Weibo.prototype = {
   handle: function (app) {
     app.get(authRedirectURI, function (req, res) {
       oauth.getOAuthAccessToken(req.query.code, {
         grant_type: 'authorization_code',
         redirect_uri: 'http://127.0.0.1:3001'+authRedirectURI,
       }, function (err, access_token, refresh_token, results) {
         res.cookie('weibo_access_token', access_token);
         res.redirect("/resources/weibo/topics");
       }); 
     });

     app.get("/resources/weibo/deauthorize", function (req, res) {
       res.cookie('weibo_access_token', ''); 
       res.send(200, 'deauthorized');
     });

     app.get("/resources/weibo/topics", function (req, res) {
       if (!req.cookies.weibo_access_token) {
         var params = {
           client_id: APP_KEY,
           redirect_uri: 'http://127.0.0.1:3001'+authRedirectURI,
           display: 'mobile'
         };
         res.redirect("https://api.weibo.com/oauth2/authorize?"+qs.stringify(params));
       } else {
         oauth.get("https://api.weibo.com/2/statuses/home_timeline.json", req.cookies.weibo_access_token, function (err, result, response) {
           res.send(200, result);
         });
       }
     });
   },


   getTopics: function (req, cb) {
     var self = this;
     oauth.get("https://api.weibo.com/2/statuses/home_timeline.json", req.cookies.weibo_access_token, function (err, result, response) {
       var res = JSON.parse(result);
       var ts = res.statuses;
       console.log(ts.length);
       var topics = [];
       for (var i=0,t; t=ts[i]; i++) {
         topics.push(self.getStatus(t));
       }
       cb(topics);
     });
   },

   getStatus: function (t) {
     var s = {
       "reposts_count": t.reposts_count,
       "comments_count": t.comments_count,
       "created_at": t.created_at,
       "text": t.text,
       "retweeted_status": (t.retweeted_status ? this.getStatus(t.retweeted_status) : null)
     };
     if (t.user) {
       s.profile_image_url = t.user.profile_image_url;
       s.screen_name = t.user.screen_name;
       s.location = t.user.location;
     }
     return s;
   }

};

module.exports = new Weibo();
