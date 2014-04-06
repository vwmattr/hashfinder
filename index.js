// web.js
var express = require("express");
var util = require("util");
var logfmt = require("logfmt");
var app = express();
var twitterAPI = require('node-twitter-api');
var creds = require("./mycreds");

app.use(logfmt.requestLogger());

var twiRequestToken;
var twiRequestSecret;

var twitter = new twitterAPI({
	consumerKey: creds.consumerKey,
	consumerSecret: creds.consumerSecret,
	callback: 'http://hashfinder.herokuapp.com/twi-auth'
});

app.get('/', function(req, res) {
	response = "Nope!";
	twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results) {
		if (error) {
			var errorString = util.inspect(error, false, null);
			console.log("Error getting OAuth request token : " + errorString);
			res.send(errorString);
		} else {
			//store token and tokenSecret somewhere, you'll need them later; redirect user
			twiRequestToken = requestToken;
			twiRequestSecret = requestTokenSecret;
			response = "Request Token obtained: " + twiRequestToken + " : " + twiRequestSecret;
			console.log(response);
			res.redirect("https://twitter.com/oauth/authenticate?oauth_token=" + twiRequestToken);
			res.send(response);
		}
	});

});

app.get('/twi-auth', function(req, res) {
	console.log("!~@~@~@~@~@~@~@! TWI-AUTH SAY MOO !~@~@~@~@~@~@~@!");

	if (twiRequestToken == req.query.oauth_token) {
		twitter.getAccessToken(twiRequestToken, twiRequestSecret, req.query.oauth_verifier,
			function(error, accessToken, accessTokenSecret, results) {
				if (error) {
					console.log(error);
				} else {
					//store accessToken and accessTokenSecret somewhere (associated to the user)
					//Step 4: Verify Credentials belongs here
					twitter.verifyCredentials(accessToken, accessTokenSecret,
						function(error, data, response) {
							if (error) {
								//something was wrong with either accessToken or accessTokenSecret
								//start over with Step 1
							} else {
								//accessToken and accessTokenSecret can now be used to make api-calls (not yet implemented)
								//data contains the user-data described in the official Twitter-API-docs
								//you could e.g. display his screen_name
								console.log(data["screen_name"]);
							}
							res.send("Hello " + data["screen_name"]);
						});
				}
			});
	} else {
		res.send("Couldn't help ya, request token mismatch: mine: " + twiRequestToken + " yours: " + req.query.oauth_token);
	}

});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
});