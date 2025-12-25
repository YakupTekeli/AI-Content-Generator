const contentService = require("../services/contentService");

exports.generateContent = async (req, res) => {
  try {
    const requestData = req.body;

    const generatedContent = await contentService.generate(requestData);

    res.status(200).json({
      success: true,
      data: generatedContent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Content generation failed"
    });
  }
};
