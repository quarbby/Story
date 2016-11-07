var mongoose = require('mongoose');

var StorySchema = new mongoose.Schema({
  title: String,
  link: String,
  sentences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sentence' }]
});

mongoose.model('Story', StorySchema);