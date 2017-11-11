// Require
const TelegramBot = require('node-telegram-bot-api');
const storage = require('./storage');
const utils = require('./utils');
const _ = require('lodash');

// Consts
const helpMsg = `/token - generate token`;
const helloMsg = `Hi, I'm notifer bot! I will send notifications to you whenever you will make API requests to me.

${helpMsg}`;

// Helpers
const modMsgText = (text) => {
  if(!text) return '';
  let modText = text;
  modText = modText.replace(/\\r\\n/g, "\r\n");
  return modText;
}

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


// NotifierBot
class NotifierBot{
  constructor({token, url}){
    this.serviceUrl = url;
    this.tgbot = new TelegramBot(token, {polling: true});
    this.tgbot.on('message', msg => this.onBotMessage(msg));
  }

  // Bot

  sendMsgWithToken(token, text, opt){
    const chatData = getChatDataWithToken(token);
    if(!chatData) return {error: {name: 'TOKEN_NOT_FOUND', data: {token}}};
    const { chatId } = chatData;
    this.sendMsg(chatId, text, opt);
    return {result: true};
  }

  sendMsg(chatId, text, opt = {}){
    let modOpt = {
      parse_mode: 'markdown',
    };
    if(opt.mode){
      modOpt.parse_mode = opt.mode;
    }
    const modText = modMsgText(text);
    this.tgbot.sendMessage(chatId, modText, modOpt);
  }

  // Events

  onBotMessage(msg){
    const {text} = msg;
    const chatId = msg.chat.id;
    console.log(`[${chatId}][income]: ${text}`);
    let chatData = storage.get(chatId) || {};
    if(text === '/start'){
      return this.sendMsg(chatId, helloMsg);
    }else if(text === '/help'){
      return this.sendMsg(chatId, helpMsg);
    }else if(text === '/token'){
      if(!chatData.tokens){
        chatData.tokens = [];
      }
      const accessToken = utils.genAccessToken();
      chatData.tokenWaitForName = accessToken;
      storage.set(chatId, chatData);
      this.sendMsg(chatId, `Please provide token name`);
    }else if(chatData.tokenWaitForName){
      const token = chatData.tokenWaitForName;
      const name = text;
      const tokens = chatData.tokens || [];
      const tokenWithName = _.find(tokens, token => token.name === name);
      if(tokenWithName){
        this.sendMsg(chatId, `This name used already. Please provide another one`);
      }else{
        console.log(`[${chatId}]: new token generated "${name}" (${token})`);
        const newTokens = [{token, name}, ...tokens];
        chatData.tokens = newTokens;
        delete chatData.tokenWaitForName;
        storage.set(chatId, chatData);
        if(!this.serviceUrl){
          this.sendMsg(chatId, 'Token created! ');
          this.sendMsg(chatId, token);
        }else{
          this.sendMsg(chatId, 'Token created! Please use this url for sending messages.');
          this.sendMsg(chatId, `${this.serviceUrl}/msg?token=${token}`);
        }
      }
    }else{
      this.sendMsg(chatId, 'Sorry, I\'m not understand you =(');
    }
  }
}

// Exports
module.exports = NotifierBot;
