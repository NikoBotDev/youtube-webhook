const {config} = require('dotenv');
config();
const {WebhookClient} = require('discord.js');
const tracker = require('./tracker');
const {TOKEN, ID} = process.env;
const webhook = new WebhookClient(ID, TOKEN, {
  disableEveryone: true
});

setInterval(async () => {
  const {embeds, channel} = await tracker();
  if (!embeds || embeds.length === 0) return;
  return webhook.send('', {
    username: channel.name,
    avatarURL: channel.avatarURL,
    embeds
  });
}, 6e4 * 5)