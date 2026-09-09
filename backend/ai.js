const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function explainCode(language, code, output, error) {

    const startTime = Date.now();

    const prompt = `
You are Decodex AI, a beginner-friendly programming tutor.

Analyze this ${language} program.

CODE:
${code}

OUTPUT:
${output || "No output"}

ERROR:
${error || "No error"}

Give a SHORT and SIMPLE explanation.

Use exactly this format:

EXECUTION FLOW:
1. First step
2. Second step
3. Next important step

KEY CONCEPTS:
- Concept: brief explanation
- Concept: brief explanation

FINAL RESULT:
One or two sentences explaining the result.

${error ? `
ERROR EXPLANATION:
- What went wrong
- How to fix it
` : ""}

Rules:
- Use very simple English.
- Keep the explanation concise.
- Do not rewrite the code.
- Do not repeat the code.
- Do not add unnecessary information.
`;

    console.log("AI request started");

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
            thinkingConfig: {
                thinkingLevel: "minimal"
            },
            maxOutputTokens: 300
        }
    });

    const endTime = Date.now();

    console.log(`AI response received in ${endTime - startTime} ms`);

    return response.text;
}

module.exports = {
    explainCode
};