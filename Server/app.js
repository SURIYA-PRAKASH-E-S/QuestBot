const express = require('express');
const cors = require('cors');
const { NlpManager } = require('node-nlp');
const nlp = require('compromise');

const app = express();

app.use(cors());
app.use(express.json());

// Initialize NLP Manager
const manager = new NlpManager({ languages: ['en'] });

// Add intents and responses
manager.addDocument('en', 'hi', 'greeting.hello');
manager.addDocument('en', 'hello', 'greeting.hello');
manager.addDocument('en', 'what do you offer', 'services.offer');
manager.addDocument('en', 'bye', 'goodbye.exit');
manager.addDocument('en', 'can you book a meeting', 'booking.meeting');
manager.addDocument('en', 'book a table for me', 'booking.table');

manager.addAnswer('en', 'greeting.hello', 'Hello! How can I assist you today?');
manager.addAnswer('en', 'services.offer', 'I can assist with booking services and general queries.');
manager.addAnswer('en', 'goodbye.exit', 'Goodbye! Take care!');
manager.addAnswer('en', 'booking.meeting', 'Sure, I can help you book a meeting.');
manager.addAnswer('en', 'booking.table', 'Absolutely! Let me know the date and time.');

// Train the NLP model
(async () => {
  console.log('Training the NLP model...');
  await manager.train();
  manager.save();
  console.log('Training completed.');
})();

app.get('/', (req, res) => {
  res.send("WELCOME NLP CHAT");
});

// NLP Route
app.post('/api/chat', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid input. Please provide a valid query string.' });
    }

    // Process the input with NLP.js
    const response = await manager.process('en', query);

    // Use Compromise for additional entity extraction
    const doc = nlp(query);
    const people = doc.people().out('array'); // Extract names
    const dates = doc.match('#Date').out('array'); // Extract dates using match()

    // Enhance the response with entity data
    let enhancedResponse = response.answer || "I'm sorry, I didn't understand that.";
    if (people.length > 0) {
      enhancedResponse += ` I noticed you're referring to ${people.join(', ')}.`;
    }
    if (dates.length > 0) {
      enhancedResponse += ` Did you mean the date(s): ${dates.join(', ')}?`;
    }

    res.json({
      response: enhancedResponse,
      intent: response.intent || 'unknown',
      entities: { people, dates },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
