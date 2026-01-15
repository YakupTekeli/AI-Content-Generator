const openai = require("../config/openai");

const parseJsonResponse = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (innerError) {
        return null;
      }
    }
  }
  return null;
};

const unescapeJsonString = (value) => {
  if (!value) return '';
  return value
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t');
};

const extractField = (text, fieldName, nextFieldName) => {
  if (!text) return '';
  if (nextFieldName) {
    const pattern = new RegExp(
      `"${fieldName}"\\s*:\\s*"([\\s\\S]*?)"\\s*,\\s*"${nextFieldName}"`,
      'i'
    );
    const match = text.match(pattern);
    if (match && match[1]) return unescapeJsonString(match[1]);
  }

  const loosePattern = new RegExp(`"${fieldName}"\\s*:\\s*"([\\s\\S]*?)"\\s*$`, 'i');
  const looseMatch = text.match(loosePattern);
  if (looseMatch && looseMatch[1]) return unescapeJsonString(looseMatch[1]);

  const truncatedPattern = new RegExp(`"${fieldName}"\\s*:\\s*"([\\s\\S]*)$`, 'i');
  const truncatedMatch = text.match(truncatedPattern);
  if (truncatedMatch && truncatedMatch[1]) return unescapeJsonString(truncatedMatch[1]);
  return '';
};

const normalizeExercises = (exercises) => {
  if (!Array.isArray(exercises)) return [];
  return exercises
    .map((exercise) => ({
      question: exercise.question ? String(exercise.question) : '',
      options: Array.isArray(exercise.options) ? exercise.options.map((opt) => String(opt)) : [],
      correctAnswer: exercise.correctAnswer ? String(exercise.correctAnswer) : '',
      explanation: exercise.explanation ? String(exercise.explanation) : '',
      focusWord: exercise.focusWord ? String(exercise.focusWord) : ''
    }))
    .filter((exercise) => exercise.question && exercise.options.length >= 2 && exercise.correctAnswer);
};

exports.generate = async (requestData) => {
  const { topic, level, difficulty, type, language, interests, keywords, aiSettings } = requestData;
  const normalizedType = String(type || '').trim();
  const includeExercises = normalizedType === 'Exercise';
  const typeInstructions = {
    Article: 'Write a short informative article with 2-3 concise paragraphs.',
    Story: 'Write a short narrative story with a clear beginning, middle, and end.',
    Dialogue: 'Write a dialogue between two people with at least 6 lines. Format each line as "Name: sentence".',
    Exercise: 'Write a short instruction paragraph (2-3 sentences) that introduces the exercises below.'
  };
  const typeInstruction = typeInstructions[normalizedType] || 'Write clear, well-structured content.';

  const keywordsLine = keywords && keywords.length ? `Primary keywords (must prioritize): ${keywords.join(', ')}\n` : '';
  const interestsLine = interests && interests.length ? `Secondary interests (optional context): ${interests.join(', ')}\n` : '';
  const priorityLine = keywords && keywords.length
    ? 'Keywords are higher priority than interests. If they conflict, follow keywords.\n'
    : '';
  const difficultyLine = difficulty ? `Difficulty: ${difficulty}\n` : '';
  const restrictedLine = aiSettings?.restrictedTopics?.length
    ? `Avoid these topics: ${aiSettings.restrictedTopics.join(', ')}\n`
    : '';
  const safetyLine = aiSettings?.safetyMode === 'strict'
    ? 'Follow strict safety guidelines and avoid any sensitive content.\n'
    : '';

  const prompt = `Generate a ${normalizedType} about "${topic}".
${typeInstruction}
${keywordsLine}${interestsLine}${priorityLine}${restrictedLine}${safetyLine}Level: ${level}
${difficultyLine}Language: ${language}
Return ONLY valid JSON with this exact shape:
{
  "title": "string",
  "content": "string",
  "exercises": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string",
      "focusWord": "string or empty"
    }
  ]
}
Keep the content between 140 and 220 words.
${includeExercises ? 'Generate exactly 3 exercises related to the content and level.' : 'Set "exercises" to an empty array and do not include any questions.'}
${includeExercises ? 'Keep each explanation to one sentence (max 20 words).' : ''}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an educational content generator. Output JSON only." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 900,
    response_format: { type: "json_object" }
  });

  const rawContent = response.choices[0].message.content;
  const parsed = parseJsonResponse(rawContent);
  const exercises = includeExercises ? normalizeExercises(parsed?.exercises) : [];
  const fallbackTitle = extractField(rawContent, 'title', 'content');
  const fallbackContent = extractField(rawContent, 'content', 'exercises');

  return {
    title: parsed?.title || fallbackTitle || `${topic} - Generated Content`,
    level,
    difficulty,
    type,
    language,
    content: parsed?.content || fallbackContent || rawContent,
    exercises
  };
};
