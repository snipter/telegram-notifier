// Check
if(!process.env.TOKEN) throw new Error('TOKEN required');
// Require
const _ = require('lodash');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const storage = require('./lib/storage');
const utils = require('./lib/utils');

// Configs
const PORT = process.env.PORT || 8080;
const TOKEN = process.env.TOKEN;
const URL = process.env.URL;

// Bot
const bot = new TelegramBot(TOKEN, {polling: true});

// App
const app = express();
app.use(bodyParser.json());

// Middleware
app.use((req, res, next) => {
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
  };
  res.error = (data, code) => {
    const statusCode = code || 400;
    res.status(statusCode).json({err: data});
  }
  res.result = (data, code) => {
    const statusCode = code || 200;
    res.status(statusCode).json({result: data || "OK"});
  }
  next();
});

// Functions

const getChatDataWithToken = (token) => {
  const storageData = storage.getStoreage();
  if(!storageData) return null;
  const chatIds = Object.keys(storageData);
  for(let i = 0; i < chatIds.length; i++){
    const chatId = chatIds[i];
    const chatData = storageData[chatId];
    if(!chatData || !chatData.tokens || !chatData.tokens.length) continue;
    const {tokens} = chatData;
    for(let j = 0; j < tokens.length; j++){
      const tokenData = tokens[j];
      if(tokenData.token === token){
        return Object.assign({}, {chatId}, chatData, {tokenData: tokenData});
      }
    }
  }
  return null;
}

// Requests
app.get('/msg', (req, res) => {
  const {query = {}} = req;
  const {token, text} = query;
  if(!token) return res.error({name: 'PARAM_NOT_SET', data: {name: 'token'}});
  if(!text)  return res.error({name: 'PARAM_NOT_SET', data: {name: 'text'}});
  const chatData = getChatDataWithToken(token);
  if(!chatData)  return res.error({name: 'TOKEN_NOT_FOUND', data: {token}});
  const {chatId, tokenData} = chatData;
  let msgText = tokenData && tokenData.name ? `*${tokenData.name}*\r\n${text}` : text;
  console.log(`[${chatId}][outcome]: ${JSON.stringify(msgText)}`);
  bot.sendMessage(chatId, msgText, {parse_mode: 'markdown'});
  res.result();
});

// Run
app.listen(PORT, () => {
  console.log(`Express server is listening on ${PORT}`);
});

// Bot
bot.on('message', msg => {
  const {text} = msg;
  const chatId = msg.chat.id;
  console.log(`[${chatId}][income]: ${text}`);
  let chatData = storage.get(chatId) || {};
  if(text === '/token'){
    if(!chatData.tokens){
      chatData.tokens = [];
    }
    const accessToken = utils.genAccessToken();
    chatData.tokenWaitForName = accessToken;
    storage.set(chatId, chatData);
    return bot.sendMessage(chatId, `Please provide token name`);
  }else if(chatData.tokenWaitForName){
    const token = chatData.tokenWaitForName;
    const name = text;
    const tokens = chatData.tokens || [];
    const tokenWithName = _.find(tokens, token => token.name === name);
    if(tokenWithName){
      return bot.sendMessage(chatId, `This name used already. Please provide another one`);
    }else{
      console.log(`[${chatId}]: new token generated "${name}" (${token})`);
      const newTokens = [{token, name}, ...tokens];
      chatData.tokens = newTokens;
      delete chatData.tokenWaitForName;
      storage.set(chatId, chatData);
      if(!URL){
        return bot.sendMessage(chatId, 'Token created!');
      }else{
        bot.sendMessage(chatId, 'Token created! Please use this url for sending messages.');
        return bot.sendMessage(chatId, `${URL}/msg?token=${token}`);
      }
    }
  }
  bot.sendMessage(chatId, 'Sorry, I\'m not understand you =(');
});
