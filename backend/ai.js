const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


async function explainCode(language, code, output, error) {

    const prompt = `
You are Decodex AI, a beginner-friendly programming tutor.

Analyze the following ${language} program.

CODE:
${code}

PROGRAM OUTPUT:
${output || "No output"}

PROGRAM ERROR:
${error || "No error"}

Explain the program in very simple English.

Follow this exact structure:

EXECUTION FLOW:
1. Explain the first important step.
2. Explain the next important step.
3. Continue until the program finishes.

KEY CONCEPTS:
- Mention the important programming concepts used.
- Explain them briefly.

FINAL RESULT:
Explain what the program finally produces.

If there is an error:

ERROR EXPLANATION:
- Explain what went wrong.
- Identify the problematic part.
- Explain how to fix it.

Rules:
- Use simple English.
- Assume the user is a beginner.
- Do not rewrite the entire program.
- Do not give unnecessary information.
`;


    const response = await ai.models.generateContent({

        model: "gemini-3.6-flash",

        contents: prompt

    });


    return response.text;
}


module.exports = {
    explainCode
};