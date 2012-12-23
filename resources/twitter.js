var http = require('http');
var qs = require('querystring');
var OAuth = require('oauth').OAuth;

var config = require("../config").site.resources.twitter;
var key = config.consumerKey;
var secret = config.consumerSecret;
var baseURI = config.baseURI;
var authRedirectPath = '/resources/twitter/authorize';

var requestTokenURI = 'https://api.twitter.com/oauth/request_token';
var accessTokenURI = 'https://api.twitter.com/oauth/access_token';
var oauth = new OAuth(requestTokenURI, accessTokenURI, key, secret, "1.0", baseURI+authRedirectPath, "HMAC-SHA1");


var Twitter = function () {
}

Twitter.prototype = {
   handle: function (app) {
     var self = this;
     app.get(authRedirectPath, function (req, res) {
       //res.cookie("twitter_oauth_verifier", req.query.oauth_verifier);
       oauth.getOAuthAccessToken(req.cookies.twitter_oauth_token, req.cookies.twitter_oauth_token_secret, req.query.oauth_verifier, function(error, oauth_access_token, oauth_access_token_secret, results){
         if (error){
           res.send(500, error.message);
         } else {
           res.cookie("twitter_oauth_access_token", oauth_access_token);
           res.cookie("twitter_oauth_access_token_secret", oauth_access_token_secret);
           res.redirect("/?source=twitter");
         }
       });
     });
   },

   getTopics: function (req, res, cb) {
     if (!req.cookies.twitter_oauth_access_token) {
       oauth.getOAuthRequestToken(function(err, oauth_token, oauth_token_secret, results){
         if (err) {
           cb({code: 500, message: err.message}, null);
         } else {
           res.cookie("twitter_oauth_token", oauth_token);
           res.cookie("twitter_oauth_token_secret", oauth_token_secret);
           cb({code: 302, message: 'https://api.twitter.com/oauth/authenticate?oauth_token='+oauth_token}, null);
         }
       });
     } else {
       var params = req.topicParams;
       oauth.get("https://api.twitter.com/1.1/statuses/home_timeline.json?"+qs.stringify(params), req.cookies.twitter_oauth_access_token, req.cookies.twitter_oauth_access_token_secret, function (err, result, response) {
         if (err) {
           cb({code: 500, message: err.message}, null);
         } else {
           cb(null, JSON.parse(result));
         }
       });
     }
   }

};

module.exports = new Twitter();
