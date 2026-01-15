const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Story', 'Article', 'Dialogue', 'Exercise', 'Other'],
    default: 'Article'
  },
  level: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String, // The main text generated
    required: true
  },
  exercises: [{
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    focusWord: String
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  keywords: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Content', ContentSchema);
