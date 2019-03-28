const axios = require('axios');
const {stringify} = require('querystring');
const {readJSON, writeJSON} = require('fs-nextra');
const {MessageEmbed} = require('discord.js');
const {join} = require('path');
const {YOUTUBE_API_KEY, CHANNEL_ID} = process.env;
const filePath = join(__dirname, 'lastIds.json');
const youtubeColor = 0xff0000;
module.exports = async () => {
    const query = stringify({
        key: YOUTUBE_API_KEY,
        channelId: CHANNEL_ID,
        part: 'snippet,id',
        order: 'date',
        maxResults: 20
    });
    const {data} = await axios.get(`https://www.googleapis.com/youtube/v3/search?${query}`);
    if(data.items.length <= 1) return;
    /**
     * @type {string[]}
     */
    let lastIds = await getLastIds();
    const embeds = [];
    const channelIndex = data.items.findIndex(item => item.id && !!item.id.channelId);

    const channel = data.items[channelIndex];

    const channelData = {
        avatarURL: channel.snippet.thumbnails.high.url,
        name: channel.snippet.channelTitle,
        id: channel.id.channelId,
    }
    const items = data.items.filter(item => item.id && !!item.id.videoId);
    for(let i = 1; i < items.length; i++) {
        if(
            lastIds.length > 0 && 
            lastIds.findIndex(video => video.videoId === data.items[i].id.videoId) >= 0
        ) {
            continue;
        }
        const video = data.items[i];
        const youtubeData = {
            videoId: video.id.videoId,
            publishedAt: video.snippet.publishedAt,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.high.url,
            channel: {
                ...channelData
            }
        };
        lastIds.push(youtubeData);

        const embed = new MessageEmbed()
            .setColor(youtubeColor)
            .setAuthor(youtubeData.channel.name, youtubeData.channel.avatarURL, `https://www.youtube.com/channel/${youtubeData.channel.id}`)
            .setDescription(`**${youtubeData.title}**\n${youtubeData.description}\n\n[Click To Watch](https://www.youtube.com/watch?v=${youtubeData.videoId})`)
            .setImage(youtubeData.thumbnail)
            .setTimestamp(new Date(youtubeData.publishedAt));
        embeds.push(embed);
    }
    
    const stored = await storeLastIds(lastIds);
    if(!stored) return null;
    return {
        embeds,
        channel: channelData
    };
};

async function getLastIds() {
    const id = await readJSON(filePath);
    return id;
}

async function storeLastIds(json) {
    try {
        await writeJSON(filePath, json);
        return true;
    } catch (err) {
        return false;
    }
}