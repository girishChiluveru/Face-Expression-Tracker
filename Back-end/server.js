// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectToMongoDB } = require('./connection');
const reportRoute=require('./routes/report');
const app = express();
const PORT = 3000;


connectToMongoDB("mongodb+srv://GirishChiluveru:admin@cluster0.ytwmf.mongodb.net/?retryWrites=true&w=majority")
.then(()=>console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));


app.use(cors({
    origin: 'http://localhost:5173'  // Frontend origin
}));
// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/',reportRoute);
let analysisResults = [];



app.post('/process', async (req, res) => {
    const { sessionId, childName } = req.body;
  
    if (!sessionId || !childName) {
      return res.status(400).json({ error: 'sessionId and childName are required' });
    }
  
    try {
      // Construct the folder path dynamically
      const photosBasePath = path.join(__dirname, 'photos'); // Adjust the base folder if needed
      const folderPath = path.join(photosBasePath, childName, sessionId);
      console.log(folderPath);
      // Check if the folder path exists
      if (!fs.existsSync(folderPath)) {
        console.error(`Error: Incoming path does not exist: ${folderPath}`);
        return res.status(400).json({ error: 'Invalid folder path' });
      }
  
      
    //   const response = await fetch('http://localhost:3000/analyze', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ folderPath }),
    // });

   //Call the Flask API with the folder path
    const response = await fetch(
      `http://127.0.0.1:5000/analyze_emotions?folder_path=${encodeURIComponent(folderPath)}`
    );
      const result = await response.json();
  
      if (!response.ok) {
        return res.status(response.status).json({
          error: result.error || 'Error analyzing emotions',
        });
      }
  
      // Save the result in memory or any desired storage
      analysisResults.push({ sessionId, childName, result });
      try{
        const storeResponse = await fetch('http://localhost:3000/store-emotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ childName, sessionId, result })
      });
      }
      catch(error){
        if (error.name === 'ValidationError') {
          console.error("Validation Error:", error.message);
          // Handle the validation error (e.g., return a response to the client)
      } else {
          console.error("An unexpected error occurred:", error);
          // Handle other types of errors
      }
      }
  
      return res.status(200).json({
        message: 'Analysis processed successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error analyzing session:', error);
      return res.status(500).json({ error: 'Error processing analysis' });
    }

   
    
  
  });
app.get('/results', (req, res) => {
    res.json(analysisResults);
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    
});