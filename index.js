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
			res.send(response);
		}
	});
	
	
});

app.get('/twi-auth', function(req, res) {
	console.log("!~@~@~@~@~@~@~@! /twi-auth say moo !~@~@~@~@~@~@~@!");
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
});