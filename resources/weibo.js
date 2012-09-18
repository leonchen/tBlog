var config = require("../config").site.resources.weibo;

var APP_KEY = config.appKey;
var APP_SECRET = config.appSecret;
var baseURI = config.baseURI;
var OAuth2 = require('oauth').OAuth2;
var http = require('http');
var qs = require('querystring');

var oauth = new OAuth2(APP_KEY, APP_SECRET, 'https://api.weibo.com', '/oauth2/authorize', '/oauth2/access_token');
var authRedirectPath = '/resources/weibo/authorize';
var deauthRedirectPath = '/resources/weibo/deauthorize';


var Weibo = function () {
}

Weibo.prototype = {
   handle: function (app) {
     app.get(authRedirectPath, function (req, res) {
       oauth.getOAuthAccessToken(req.query.code, {
         grant_type: 'authorization_code',
         redirect_uri: baseURI + authRedirectPath,
       }, function (err, access_token, refresh_token, results) {
         if (err) {
           cb({code: 500, message: err.message}, null);
         } else {
           res.cookie('weibo_access_token', access_token);
           res.redirect("/");
         }
       }); 
     });

     app.get(deauthRedirectPath, function (req, res) {
       res.cookie('weibo_access_token', ''); 
       res.send(200, 'Authentication canceled.');
     });
   },

   getTopics: function (req, res, cb) {
     if (!req.cookies.weibo_access_token) {
       var params = {
         client_id: APP_KEY,
         redirect_uri: baseURI + authRedirectPath,
         display: 'mobile'
       };
       cb({code: 302, message: "https://api.weibo.com/oauth2/authorize?"+qs.stringify(params)}, null);
     } else {
       oauth.get("https://api.weibo.com/2/statuses/home_timeline.json", req.cookies.weibo_access_token, function (err, result, response) {
         if (err) {
           cb({code: 500, message: err.message}, null);
         } else {
           cb(null, JSON.parse(result).statuses);
         }
       });
     }
   }

};

module.exports = new Weibo();
