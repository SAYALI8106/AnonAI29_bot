const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// ✅ /start Command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `👋 Hello ${msg.chat.first_name}! I'm an AI-powered bot.\nType /help to see my features!`
  );
});

// ✅ /help Command
bot.onText(/\/help/, (msg) => {
  const helpMessage = `
🚀 Features:
/news - Get summarized news 📰
/joke - Get a random joke 🤣
/quote - Get a motivational quote 💡
/weather <city> - Get weather info ☁️
/lyrics <song name> - Get song lyrics 🎵
/help - Show available commands
    `;
  bot.sendMessage(msg.chat.id, helpMessage);
});

// ✅ Lyrics Feature with YouTube Search Fallback
bot.onText(/\/lyrics (.+)/, async (msg, match) => {
  const songName = match[1];
  const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(songName)}`;

  try {
    bot.sendChatAction(msg.chat.id, "typing");

    const response = await axios.get(apiUrl);

    if (response.data.lyrics) {
      bot.sendMessage(msg.chat.id, `🎵 Lyrics for *${songName}*:\n\n${response.data.lyrics.substring(0, 4096)}`);
    } else {
      throw new Error("Lyrics not found");
    }
  } catch (error) {
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songName + " lyrics")}`;
    bot.sendMessage(msg.chat.id, `🔍 Lyrics not found. Watch on YouTube: [Click Here](${youtubeSearchUrl})`, {
      parse_mode: "Markdown",
    });
  }
});

// ✅ News Feature
bot.onText(/\/news/, async (msg) => {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const newsUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`;

  try {
    bot.sendChatAction(msg.chat.id, "typing");

    const newsResponse = await axios.get(newsUrl);
    if (!newsResponse.data.articles.length) {
      return bot.sendMessage(msg.chat.id, "⚠️ No news available at the moment.");
    }

    const article = newsResponse.data.articles[0];
    bot.sendMessage(msg.chat.id, `📰 *${article.title}*\n\n${article.description}`);
  } catch (error) {
    bot.sendMessage(msg.chat.id, "⚠️ Couldn't fetch news right now.");
    console.error("News API Error:", error);
  }
});

// ✅ Joke Feature
bot.onText(/\/joke/, async (msg) => {
  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");

    bot.sendMessage(msg.chat.id, `🤣 Here's a joke:\n${response.data.setup}`);

    setTimeout(() => {
      bot.sendMessage(msg.chat.id, response.data.punchline);
    }, 3000);
  } catch (error) {
    bot.sendMessage(msg.chat.id, "⚠️ Couldn't fetch a joke.");
    console.error("Joke API Error:", error);
  }
});

// ✅ Motivational Quotes Feature
bot.onText(/\/quote/, async (msg) => {
  try {
    bot.sendChatAction(msg.chat.id, "typing");

    const response = await axios.get("https://zenquotes.io/api/random");

    if (!response.data || !response.data[0]) {
      throw new Error("Invalid quote response.");
    }

    bot.sendMessage(msg.chat.id, `💡 *${response.data[0].q}*\n— ${response.data[0].a}`);
  } catch (error) {
    bot.sendMessage(msg.chat.id, "⚠️ Couldn't fetch a quote.");
    console.error("Quote API Error:", error);
  }
});

// ✅ Weather Feature
bot.onText(/\/weather (.+)/, async (msg, match) => {
  const city = match[1];
  const apiKey = process.env.WEATHER_API_KEY;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    bot.sendChatAction(msg.chat.id, "typing");

    const response = await axios.get(weatherUrl);
    const { main, weather, name } = response.data;

    bot.sendMessage(
      msg.chat.id,
      `🌤 Weather in *${name}*:\n🌡 Temp: ${main.temp}°C\n☁ Condition: ${weather[0].description}`
    );
  } catch (error) {
    bot.sendMessage(msg.chat.id, "⚠️ Couldn't fetch weather info.");
    console.error("Weather API Error:", error);
  }
});

// ✅ Handles Unknown Messages
bot.on("message", (msg) => {
  if (!msg.text.startsWith("/")) {
    bot.sendChatAction(msg.chat.id, "typing");

    setTimeout(() => {
      bot.sendMessage(msg.chat.id, "🤖 I didn't understand that. Type /help for commands.");
    }, 1500);
  }
});

console.log("🚀 AI Bot is running...");
