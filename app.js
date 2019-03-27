const {config} = require('dotenv');
config();
const {WebhookClient, MessageEmbed} = require('discord.js');
const tracker = require('./tracker');
const {TOKEN, ID} = process.env;
const youtubeColor = 0xff0000;
const webhook = new WebhookClient(ID, TOKEN, {
  disableEveryone: true
});

setInterval(async () => {
  const data = await tracker();
  if (!data) return;
  const {
    snippet: {
      thumbnails: {
        high: {
          url: channelAvatar
        }
      },
      channelTitle,
    },
    id: {
      channelId
    }
  } = data.channel;
  const {
    id: {
      videoId
    },
    snippet: {
      publishedAt,
      title: videoTitle,
      description,
      thumbnails: {
        high: {
          url: videoThumbnail
        }
      }
    }
  } = data.video;
  const embed = new MessageEmbed()
    .setColor(youtubeColor)
    .setAuthor(channelTitle, channelAvatar, `https://www.youtube.com/channel/${channelId}`)
    .setDescription(`**${videoTitle}**\n${description}\n\n[Click To Watch](https://www.youtube.com/watch?v=${videoId})`)
    .setImage(videoThumbnail)
    .setTimestamp(new Date(publishedAt));
  return webhook.send('', {
    username: channelTitle,
    avatarURL: channelAvatar,
    embeds: [embed]
  });
}, 1e4)