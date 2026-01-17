const openai = require('../config/openai');

/**
 * Translate text to target language using OpenAI
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language (e.g., 'Turkish', 'Spanish')
 * @returns {Promise<string>} Translated text
 */
exports.translate = async (text, targetLanguage = 'Turkish') => {
    if (!text || !text.trim()) {
        throw new Error('Text to translate is required');
    }

    if (!targetLanguage || !targetLanguage.trim()) {
        throw new Error('Target language is required');
    }

    const prompt = `Translate the following text to ${targetLanguage}. Maintain the same formatting, structure, and tone. If there are dialogue lines (Name: text), preserve that format. Output ONLY the translated text, nothing else.

Text to translate:
${text}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a professional translator. Translate the given text accurately while preserving formatting and tone."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2000
        });

        const translatedText = response.choices[0].message.content.trim();

        if (!translatedText) {
            throw new Error('Translation service returned empty response');
        }

        return translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        throw new Error(`Translation failed: ${error.message}`);
    }
};
