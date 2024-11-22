const path = require('path');
const { analyzeFolder } = require('../models/imageAnalysis');

// Analyze folder controller
async function analyzeFolderController(req, res) {
    try {
        const { folderName } = req.body;

        if (!folderName) {
            return res.status(400).json({ error: "Folder name is required" });
        }

        const folderPath = path.resolve(__dirname, "../photos", folderName.trim());
        const analysisResults = await analyzeFolder(folderPath);
console.log('__dirname:', __dirname);
console.log('folderName:', folderName);

console.log('folderPath:', folderPath);

        return res.json({ folderName, analysisResults });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}

module.exports = {
    analyzeFolderController,
};
