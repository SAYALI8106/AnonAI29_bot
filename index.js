const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();
console.log(process.env.TELEGRAM_TOKEN);

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});

bot.on('message', (option) => {
    console.log("Message received on the bot:", option);
    bot.sendMessage(option.chat.id, "Hello, I'm a JokeBot!. Please type /joke to get a random joke.");
});

bot.onText(/\/joke/, async(option) => {
   const response = await axios.get('http://www.official-joke-api.appspot.com/random_joke');
   console.log(response.data);

   const setup = response.data.setup;
   const punchline = response.data.punchline;
   bot.sendMessage(option.chat.id, setup + "\n" + punchline);
});
