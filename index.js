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

// Set Telegram Webhook (Replace YOUR_DOMAIN)
const webhookURL = `https://YOUR_DOMAIN.com/bot${process.env.TELEGRAM_TOKEN}`;
bot.setWebHook(webhookURL);

app.use(express.json()); // Middleware to parse JSON

// Handle incoming messages from Telegram
app.post(`/bot${process.env.TELEGRAM_TOKEN}`, async (req, res) => {
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
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: userInput }],
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("AI Error:", error);
        return "Oops! Something went wrong.";
    }
};

// Start Express server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
