class Content {
  constructor(topic, level, difficulty, type, language) {
    this.topic = topic;
    this.level = level;
    this.difficulty = difficulty;
    this.type = type;
    this.language = language;
    this.createdAt = new Date();
  }
}

module.exports = Content;
