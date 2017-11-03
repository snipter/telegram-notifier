// Require
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
// Configs
const PORT = process.env.PORT;
const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
// Bot
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${url}/bot${TOKEN}`);
// App
const app = express();
app.use(bodyParser.json());
// Requests
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
// Run
app.listen(PORT, () => {
  console.log(`Express server is listening on ${PORT}`);
});
// Bot
bot.on('message', msg => {
  bot.sendMessage(msg.chat.id, 'I am alive!');
});
