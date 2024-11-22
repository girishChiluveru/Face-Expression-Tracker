const fs = require('fs');
const path = require('path');

const os = require('os');


const API_URL = "https://api-inference.huggingface.co/models/trpakov/vit-face-expression";
const API_TOKEN = "Bearer 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";

// Helper to read a file
async function readFileAsync(filePath) {
    return fs.promises.readFile(filePath);
}

// Helper to send image data to the Hugging Face API
async function sendToAPI(fileBuffer) {
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(API_URL, {
        headers: {
            Authorization: API_TOKEN,
            "Content-Type": "application/octet-stream",
        },
        method: "POST",
        body: fileBuffer,
    });

    if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
    }
    return response.json();
}

// Analyze a single image
async function analyzeImage(filePath) {
    const fileBuffer = await readFileAsync(filePath);
    const result = await sendToAPI(fileBuffer);

    if (!Array.isArray(result) || result.length === 0) {
        throw new Error("Invalid API response format");
    }

    const emotions = result[0];
    const maxEmotion = Object.entries(emotions).reduce((a, b) => (a[1] > b[1] ? a : b));

    return {
        emotions,
        max_emotion: {
            emotion: maxEmotion[0],
            score: maxEmotion[1],
        },
    };
}

// Analyze all images in a folder
async function analyzeFolder(folderPath, maxConcurrent = os.cpus().length) {
    if (!fs.existsSync(folderPath)) {
        throw new Error(`Directory not found: ${folderPath}`);
    }

    const files = fs.readdirSync(folderPath).filter(
        (file) => /\.(png|jpg|jpeg|bmp)$/i.test(file) && !file.toLowerCase().startsWith("screenshot")
    );

    if (files.length === 0) {
        throw new Error("No valid images found in directory");
    }

    const filePaths = files.map((file) => path.join(folderPath, file));
    const resultsQueue = [];
    const semaphore = Array(maxConcurrent).fill(Promise.resolve());
    const results = {};

    for (const filePath of filePaths) {
        const task = async () => {
            try {
                const result = await analyzeImage(filePath);
                results[path.basename(filePath)] = result;
            } catch (error) {
                results[path.basename(filePath)] = { error: error.message };
            }
        };

        const currentTask = semaphore.shift().then(task);
        semaphore.push(currentTask);
        resultsQueue.push(currentTask);
    }

    await Promise.all(resultsQueue);
    return results;
}

module.exports = {
    analyzeImage,
    analyzeFolder,
};
