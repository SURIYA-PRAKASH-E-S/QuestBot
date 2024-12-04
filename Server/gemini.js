const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require("readline");

// Initialize API key and configuration
const API_KEY = `AIzaSyBeCn02TRCtxkEBkMJVek7YiMuRqeJQL04`; // Replace with your API key
const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig = {
  stopSequences: ["red"],
  maxOutputTokens: 100,
  temperature: 0.9,
  topP: 0.1,
  topK: 16,
};

// Set up readline for dynamic user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Initialize the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const initialPrompt = `Now, you are my ChatBot named Questbot that helps people to book their turf. You need to answer any question that users ask related to booking, queries, payment, and turf open and close timing.`;

(async () => {
  try 
  {
    console.log("Questbot is ready to assist you. Ask your questions!");

    // Function to handle user queries
    const handleQuery = async (query) => {
      console.log("\nQuestbot is thinking...\n");
      const result = await model.generateContentStream(
        `${initialPrompt}\nUser: ${query}`,
        generationConfig
      );

      // Stream the response
      for await (const chunk of result.stream) {
        process.stdout.write(chunk.text());
      }
      console.log("\n"); // Add spacing after the bot's response
      askUser(); // Prompt for the next question
    };

    // Function to prompt user input
    const askUser = () => {
      rl.question("You: ", (query) => {
        if (query.toLowerCase() === "exit") {
          console.log("Goodbye!");
          rl.close();
        } else {
          handleQuery(query);
        }
      });
    };

    askUser(); // Start the interaction loop
  } 
  
  catch (error) 
  {
    console.error("Error generating content stream:", error);
    rl.close();
  }
})();
