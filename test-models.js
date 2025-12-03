const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const modelsToTest = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-001',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-2.0-flash-exp'
    ];

    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hello');
            console.log(`✅ ${modelName} WORKS!`);
            return; // Exit after finding a working model
        } catch (e) {
            console.log(`❌ ${modelName} failed:`, e.message.split('\n')[0]);
        }
    }
}

listModels();
