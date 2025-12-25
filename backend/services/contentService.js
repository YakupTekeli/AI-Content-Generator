const openai = require("../config/openai");

exports.generate = async (requestData) => {
  const { topic, level, difficulty, type, language } = requestData;

  const prompt = `
Generate a ${type} about "${topic}".
Level: ${level}
Difficulty: ${difficulty}
Language: ${language}
Make it educational, clear, and concise.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an educational content generator." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  });

  return {
    title: `${topic} - Generated Content`,
    level,
    difficulty,
    type,
    language,
    content: response.choices[0].message.content
  };
};
