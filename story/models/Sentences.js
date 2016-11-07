var mongoose = require('mongoose');

var SentenceSchema = new mongoose.Schema({
   text: String,
   sentiment: String,
   labelColor: String,
   countryCode: String,
   timeStamp: String
});

mongoose.model('Sentence', SentenceSchema);