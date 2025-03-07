const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize Telegram Bot (Webhook Mode)
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { webHook: true });

// Set Webhook URL
const webhookURL = `https://anonai29-bot.onrender.com/${process.env.TELEGRAM_TOKEN}`;

app.use(express.json()); // Middleware to parse JSON

// Handle incoming messages from Telegram
app.post(`/${process.env.TELEGRAM_TOKEN}`, async (req, res) => {
    const option = req.body;

    if (option.message) {
        const chatId = option.message.chat.id;
        const userText = option.message.text;

        console.log(`User: ${userText}`);

        const botResponse = await getAIResponse(userText);
        bot.sendMessage(chatId, botResponse);
    }

    res.sendStatus(200); // Success response
});

// Function to get AI-generated response
const getAIResponse = async (userInput) => {
    try {
        const response = await openai.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: userInput }],
            temperature: 0.7,  // Adjust creativity
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("AI Error:", error);
        return "Oops! Something went wrong.";
    }
};

// Start Express server & Set Webhook
app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    
    try {
        await bot.setWebHook(webhookURL);
        console.log(`Webhook set to ${webhookURL}`);
    } catch (err) {
        console.error("Failed to set webhook:", err);
    }
});
