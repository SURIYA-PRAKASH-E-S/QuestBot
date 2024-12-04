const express = require('express');
const cors = require('cors');
const { NlpManager } = require('node-nlp');
const Papa = require('papaparse');
const fs = require('fs');

/* Gen Ai */

const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = `AIzaSyBeCn02TRCtxkEBkMJVek7YiMuRqeJQL04`

const generationConfig = {
  stopSequences: ["red"],
  maxOutputTokens: 5,
  temperature: 0.9,
  topP: 0.1,
  topk: 16,
};

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"}, generationConfig);
const prompt = `Now, you are my ChatBot named Questbot that help people to book theri turf you need answer any question that user asked realted to booking, queries, payment, and turf open and close timing`;

(async () => {

    const result = await model.generateContent(prompt);
    const botRes = result.response.text();
    console.log(botRes)
    
})();

/* End */

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize NLP Manager
const manager = new NlpManager({ languages: ['en'] });

// Load CSV and Train Chatbot using PapaParse
const trainChatbot = async () => {
  try {
    console.log('Loading FAQ dataset...');

    // Read the CSV file
    const csvData = fs.readFileSync('./turf_booking_faq.csv', 'utf8');

    // Parse the CSV file using PapaParse
    const parsedData = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsedData.errors.length > 0) {
      throw new Error('Error parsing CSV file: ' + JSON.stringify(parsedData.errors));
    }

    console.log('Training the chatbot...');
    parsedData.data.forEach((row) => {
      const question = row['Question'];
      const answer = row['Answer'];

      if (question && answer) {
        manager.addDocument('en', question, question); // Add question as intent
        manager.addAnswer('en', question, answer); // Add answer as response
      }
    });

    await manager.train();
    manager.save();
    console.log('Training completed.');
  } catch (error) {
    console.error('Error loading or training the chatbot:', error);
  }
};

// Train the chatbot
trainChatbot();

// API Endpoints
app.get('/', (req, res) => {
  res.send('Chatbot is running...');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid input. Provide a valid query.' });
    }

    const response = await manager.process('en', query);
    res.json({ response: response.answer || "I'm sorry, I didn't understand that." });
  } catch (error) {
    console.error('Error processing the query:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/chat', (req,res) => {
      const {query} = req.body;

      (async () => {
          const result = await model.generateContent(query);
          
          const botRes = result.response.text();

          res.json({ botReply: botRes || "I'm sorry, I didn't understand that." });
          
      })();
})

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));