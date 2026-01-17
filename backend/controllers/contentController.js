const contentService = require('../services/contentService');
const progressService = require('../services/progressService');
const Content = require('../models/Content');
const AiSettings = require('../models/AiSettings');

const normalizeKeywords = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((keyword) => String(keyword).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input.split(',').map((keyword) => keyword.trim()).filter(Boolean);
  }
  return [];
};

const containsRestrictedTopic = (text, restrictedTopics) => {
  if (!text || restrictedTopics.length === 0) return false;
  const normalized = String(text).toLowerCase();
  return restrictedTopics.some((topic) => normalized.includes(topic.toLowerCase()));
};

const isRestricted = ({ topic, keywords, interests }, restrictedTopics) => {
  if (!restrictedTopics || restrictedTopics.length === 0) return false;
  if (containsRestrictedTopic(topic, restrictedTopics)) return true;
  if (Array.isArray(keywords) && keywords.some((keyword) => containsRestrictedTopic(keyword, restrictedTopics))) {
    return true;
  }
  if (Array.isArray(interests) && interests.some((interest) => containsRestrictedTopic(interest, restrictedTopics))) {
    return true;
  }
  return false;
};

// @desc    Generate new content
// @route   POST /api/content/generate
// @access  Private
exports.generateContent = async (req, res) => {
  try {
    const { topic, level, type, language } = req.body;
    const interests = Array.isArray(req.user?.interests) ? req.user.interests : [];
    const keywords = normalizeKeywords(req.body.keywords);
    const aiSettings = await AiSettings.findOne();
    const restrictedTopics = aiSettings?.restrictedTopics || [];

    if (isRestricted({ topic, keywords, interests }, restrictedTopics)) {
      return res.status(400).json({
        success: false,
        message: 'Requested topic is restricted by admin settings'
      });
    }

    // Call service to generate content (OpenAI)
    // Note: difficulty was in the original code, but level is usually enough. keeping it if needed.
    const generatedData = await contentService.generate({
      ...req.body,
      interests,
      keywords,
      aiSettings
    });

    // Create Content record
    const content = await Content.create({
      user: req.user.id,
      topic,
      level,
      type,
      keywords,
      title: generatedData.title,
      body: generatedData.content,
      exercises: generatedData.exercises || [],
      // language and exercises would be ideal to parse out separately if the AI returns JSON
    });

    await progressService.recordActivity(req.user.id, {
      type: 'content_generated',
      metadata: {
        contentId: content._id,
        topic,
        level,
        type
      }
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

// @desc    Translate content
// @route   POST /api/content/:id/translate
// @access  Private
exports.translateContent = async (req, res) => {
  try {
    const { targetLanguage = 'Turkish' } = req.body;
    const translationService = require('../services/translationService');

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Ensure user owns this content
    if (content.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to translate this content' });
    }

    // Translate the content body
    const translatedText = await translationService.translate(content.body, targetLanguage);

    // Also translate the title
    const translatedTitle = await translationService.translate(content.title, targetLanguage);

    res.status(200).json({
      success: true,
      data: {
        original: {
          title: content.title,
          body: content.body
        },
        translated: {
          title: translatedTitle,
          body: translatedText
        },
        targetLanguage
      }
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Translation failed'
    });
  }
};

