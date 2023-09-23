const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "ping",
  aliases: [],
  category: 'info',
  description: "Gives the bot latency in milliseconds",
  cooldown: 3,
  wip: false,
  async run(client, message, args) {
    try {
      const embed = new EmbedBuilder()
      .setTitle("🏓 Ping Pong!")
      .setColor('Random')
      .setDescription(`The WebSocket Latency is \`${Math.round(client.ws.ping)}\` ms`)
      
      return message.reply({ embeds: [embed] })
    }
    catch(e) {
      console.log(e)
    }
  }
}
