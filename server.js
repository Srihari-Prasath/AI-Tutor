const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const apiKey = "AIzaSyBnkyya_DCnWvkqPp6-ja0ZFYfU3r0c0ZQ"; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Memory storage for session context
const sessionMemory = {};

// Customize the bot's name
const botName = "TutorBot";

// Serve static files (including index.html)
app.use(express.static(__dirname));

io.on("connection", (socket) => {
  console.log("a user connected");

  // Initialize memory for this session if not exists
  if (!sessionMemory[socket.id]) {
    sessionMemory[socket.id] = {
      context: null, // Store context or any other session data here
    };
  }

  socket.on("message", async (msg) => {
    const userInput = msg.toLowerCase();
    let context = sessionMemory[socket.id].context;

    // Check if the user is asking about the bot's name or its internal workings
    if (userInput.includes("your name") || userInput.includes("who are you")) {
      socket.emit("reply", `My name is ${botName}, and I'm here to help you with your questions!`);
      return;
    }

    // Initialize chat session with current or previous context
    const chatHistory = context ? [{ role: "user", parts: [{ text: context }] }] : [{ role: "user", parts: [{ text: '' }] }];

    const chatSession = model.startChat({
      generationConfig,
      history: chatHistory,
    });

    const result = await chatSession.sendMessage(msg);

    // Store the context for next interaction
    sessionMemory[socket.id].context = result.response.text();

    // Ensure the response does not reveal internal details
    const filteredResponse = result.response.text().replace(/google|api|generative ai|gemini/gi, "TutorBot");

    socket.emit("reply", filteredResponse);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");

    // Clean up session memory on disconnect
    delete sessionMemory[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
