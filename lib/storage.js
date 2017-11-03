// Require
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const _ = require('lodash');
// Configs
const DATA_FOLDER_PATH = path.resolve(__dirname + '/../data');
const DATA_FILE_PATH = `${DATA_FOLDER_PATH}/data.json`;

// Variablse
let data = {};

// Functions
const checkFolder = () => {
    try{
        fs.accessSync(DATA_FOLDER_PATH);
    }catch(e){
        const mkdirp = require('mkdirp');
        mkdirp.sync(DATA_FOLDER_PATH);
    }
}

const loadDataFile = () => {
    try{
        fs.accessSync(DATA_FILE_PATH);
        const dataStr = fs.readFileSync(DATA_FILE_PATH, 'utf8');
        data = JSON.parse(dataStr);
    }catch(e){
        data = {};
    }
}

const saveDataFile = () => {
    try{
        const dataStr = JSON.stringify(data);
        fs.writeFileSync(DATA_FILE_PATH, dataStr);
    }catch(e){
        console.error('saving file error: ', e);
    }
}

const getValue = (key) => {
    if(!data) return undefined;
    return data[key] ? _.cloneDeep(data[key]) : undefined;
}

const setValue = (key, val) => {
    data[key] = val;
    saveDataFile();
}

const getStoreage = () => {
    return data;
}

checkFolder();
loadDataFile();

module.exports = {
    getValue,
    setValue,
    get: getValue,
    set: setValue,
    getStoreage,
}