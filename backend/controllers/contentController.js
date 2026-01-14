const contentService = require('../services/contentService');
const Content = require('../models/Content');

// @desc    Generate new content
// @route   POST /api/content/generate
// @access  Private
exports.generateContent = async (req, res) => {
  try {
    const { topic, level, type, language } = req.body;

    // Call service to generate content (OpenAI)
    // Note: difficulty was in the original code, but level is usually enough. keeping it if needed.
    const generatedData = await contentService.generate(req.body);

    // Create Content record
    const content = await Content.create({
      user: req.user.id,
      topic,
      level,
      type,
      title: generatedData.title,
      body: generatedData.content,
      // language and exercises would be ideal to parse out separately if the AI returns JSON
    });

    // Award points (Gamification)
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'gamification.points': 10, 'gamification.streak': 1 }
    });

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Content generation failed'
    });
  }
};

// @desc    Get user's content history
// @route   GET /api/content/history
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const history = await Content.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single content
// @route   GET /api/content/:id
// @access  Private
exports.getContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Measure security: ensure user owns this content
    if (content.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Rate content
// @route   PUT /api/content/:id/rate
// @access  Private
exports.rateContent = async (req, res) => {
  try {
    const { rating } = req.body;

    let content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    if (content.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    content.rating = rating;
    await content.save();

    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
