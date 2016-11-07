var express = require('express');
var watson = require('watson-developer-cloud');
var api_config = require('../config/api-config');
var nlp_compromise = require('nlp_compromise');

var router = express.Router();

/* For Mongoose db */
var mongoose = require('mongoose');
var Sentence = mongoose.model('Sentence');
var Story = mongoose.model('Story');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Story' });
});

/* Watson Sentiment */

router.get('/watson/sentiment', function(req, res, next) {
    var requestText = req.query.text;

    var alchemy_language = watson.alchemy_language({
      api_key: api_config.watson_alchemy
    });
    
    var params = {
        text: requestText
    };
    
    alchemy_language.sentiment(params, function (err, response) {
        if (err) { 
            console.log('error:', err); 
            res.json({'sentiment': null});
        } else {
            var sentimentScore = parseFloat(response.docSentiment.score);
            console.log("Sentiment Score " + sentimentScore);
            //console.log(JSON.stringify(response, null, 2));
            
            // I don't know how to return this outside this function
            res.json({'sentiment': sentimentScore});
        }
    });
    
});


/* For sentences */

router.get('/sentences', function(req, res, next) {
    Sentence.find(function(err, sentences){
        if (err) { return next(err); }
        
        res.json(sentences);
    });
});

router.post('/sentences', function(req, res, next) {
    /*
    var sentence = new Sentence({
       text: req.body.text,
       sentiment: req.body.sentiment.toString(),
       labelColor: req.body.labelColor,
       countryCode: req.body.countryCode,
       sentence: req.body.timeStamp
    });
    */
    
    var sentence = new Sentence(req.body);
    
    sentence.save(function(err, sentence) {
      if (err) { return next(err); }
      
      res.json(sentence);
    });
});

// This is to call sentence only once if you're finding by ID
router.param('sentence', function(req, res, next, id){
    var query = Sentence.findById(id);
    query.exec(function (err, sentence){
       if (err) { return next(err); }
       if (!sentence) { return next(new Error('Cannot find sentence')); }
       
       req.sentence = sentence;
       return next();
    });
});

router.get('/sentences/:sentence', function(req, res) {
    res.json(req.sentence); 
});

/* These are for nlp compromise */
router.get('/nlp/nameentity', function(req, res, next) {
    //var text = req.query.text; 
    var text = 'I really love JJ Lin. Yes that\'s you.';
    var topics = nlp_compromise.text(text).topics();
    var people = nlp_compromise.text(text).people();
    console.log(people);
    res.json({topics: topics, people: people}); 
});

router.get('/googleRecaptcha', function(req, res, next) {
    console.log("Google Recaptcha");
    URL: 'https://www.google.com/recaptcha/api/siteverify?secret=' + 
            api_config.google_recaptcha_secret +
            '&response=' + req.query.googleResponse;
            
    var formData = {
           secret: api_config.google_recaptcha_secret, 
           response: req.query.googleResponse, 
        };
    
    request.post({
            url: 'https://www.google.com/recaptcha/api/siteverify',
            form: formData
        },
        function (err, httpResponse, body) {
            if(body.success == true) {
                return res.json({res: true});
            } else {
                return res.json({res: false});
            }
        });
    });


module.exports = router;
