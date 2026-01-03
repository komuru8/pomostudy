
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.argv[2];
if (!apiKey) {
    console.error("Please provide API key as argument");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Models to test: aiming for one with non-zero quota
const modelsToTest = [
    "gemini-flash-latest",
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-002" // sometimes valid
];

async function testGeneration() {
    console.log("Testing generation on alternative models...");

    for (const modelName of modelsToTest) {
        console.log(`\nTesting: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello. Reply with OK.");
            const response = await result.response;
            console.log(`✅ SUCCESS [${modelName}]: ${response.text()}`);
            return; // Stop on first success
        } catch (error) {
            console.error(`❌ FAILED [${modelName}]:`);
            // Extract useful parts of error
            if (error.message) console.error(error.message.split('Please retry')[0]);
            if (error.response) {
                try {
                    const body = await error.response.json();
                    if (body.error) console.error("API Error Body:", JSON.stringify(body.error));
                } catch (e) { }
            }
        }
    }
}

testGeneration();
