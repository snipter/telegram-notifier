// Check
if(!process.env.TOKEN) throw new Error('TOKEN required');
// Require
const TelegramBot = require('node-telegram-bot-api');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const NotifierBot = require('./lib/bot') ;

// Configs
const PORT = process.env.PORT || 8080;
const TOKEN = process.env.TOKEN;
const URL = process.env.URL;

// Bot
const bot = new NotifierBot({token: TOKEN, url: URL});

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
    res.status(statusCode).json({error: data});
  }
  res.result = (data, code) => {
    const statusCode = code || 200;
    res.status(statusCode).json({result: data || "OK"});
  }
  next();
});

// Requests
app.get('/msg', (req, res) => {
  const { query = {} } = req;
  if(!query.token) return res.error({name: 'PARAM_NOT_SET', data: {name: 'token'}});
  if(!query.text)  return res.error({name: 'PARAM_NOT_SET', data: {name: 'text'}});
  const { token, text, ...opt} = query;
  const { error } = bot.sendMsgWithToken(token, text, opt);
  if(error) return res.error(error);
  else return res.result();  
});

app.post('/msg', (req, res) => {
  const { body = {}, query = {}} = req;
  const data = Object.assign({}, body, query);
  if(!data.token) return res.error({name: 'PARAM_NOT_SET', data: {name: 'token'}});
  if(!data.text)  return res.error({name: 'PARAM_NOT_SET', data: {name: 'text'}});
  const { token, text, ...opt} = data;
  const { error } = bot.sendMsgWithToken(token, text, opt);
  if(error) return res.error(error);
  else return res.result();
});

// Run
app.listen(PORT, () => {
  console.log(`Express server is listening on ${PORT}`);
});
