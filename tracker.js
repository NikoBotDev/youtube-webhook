const axios = require('axios');
const {stringify} = require('querystring');
const {readFile, writeFile} = require('fs-nextra');
const {join} = require('path');
const {YOUTUBE_API_KEY, CHANNEL_ID} = process.env;
const filePath = join(__dirname, 'lastId.txt');
module.exports = async () => {
    const query = stringify({
        key: YOUTUBE_API_KEY,
        channelId: CHANNEL_ID,
        part: 'snippet,id',
        order: 'date',
        maxResults: 5
    });
    const {data} = await axios.get(`https://www.googleapis.com/youtube/v3/search?${query}`);
    if(data.items.length === 0) return;
    let lastId = await getLastId();
   
    if(lastId === data.items[1].id.videoId) return;
    console.log(lastId, data.items[1].id.videoId)
    lastId = data.items[1].id.videoId;
    const stored = await storeLastId(lastId);
    if(!stored) {
        console.error('Cannot store the id...');
        return;
    }
    return {
        channel: data.items[0],
        video: data.items[1]
    };
};

async function getLastId() {
    const id = await readFile(filePath, {encoding: 'utf8'});
    return id;
}

async function storeLastId(id) {
    try {
        await writeFile(filePath, id, {encoding: 'utf8'});
        return true;
    } catch (err) {
        return false;
    }
}