// web.js
var express = require("express");
var util = require("util");
var logfmt = require("logfmt");
var app = express();

var creds = {
	consumer_key: 'add consumer key here',
	consumer_secret: 'add consumer secret here',
	access_token: 'add access token here',
	access_token_secret: 'add access token secret here'
}

var twitter = require('twit');
var twit = new twitter({
	consumer_key: creds.consumerKey,
	consumer_secret: creds.consumerSecret,
	access_token: creds.accessToken,
	access_token_secret: creds.accessTokenSecret
});

app.use(logfmt.requestLogger());

var twiRequestToken;
var twiRequestSecret;

app.get('/', function(req, res) {
	res.set('Content-Type', 'application/json');
	return res.send(app.routes);
});

app.get('/stream', function(req, res) {
	console.log("starting stream");
	//
	// filter the public stream by english tweets containing `#apple`
	//
	var result = [];
	var stream = twit.stream('statuses/filter', {
		track: req.query.q,
		language: 'en'
	})

	stream.on('tweet', function(tweet) {
		var tweetS = util.inspect(tweet);
		var slimTweet = {};
		slimTweet.user = tweet.user.screen_name;
		slimTweet.text = tweet.text;
		slimTweet.source = tweet.source;
		result.push(slimTweet);
		console.log(tweetS);
		// res.write(tweetS);
	})

	setTimeout(function() {
		stream.stop();
		console.log('stopped stream');
		res.json(result);
	}, 5000);

});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
});