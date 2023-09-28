const { 
  ActionRowBuilder, 
  SelectMenuBuilder, 
  ButtonBuilder, 
  EmbedBuilder,
  ButtonStyle
} = require('discord.js');

const { stripIndents, oneLine } = require('common-tags');
const ms = require('ms')

module.exports = {    
  name: "bot", 
  description: "show bot's information", 
  aliases: ['uptime'],
  category: 'info',
  devsOnly: true,
  userPermissions: [], 
  clientPermissions: [], 
  details: [],
  cooldown: 5, // seconds
  usage: [], // if argsRequired is true then this param required
  argsRequired: false,
  wip: false,

  async run (client, message, args) {
    try {
		
		let codeBlock = (type, text) => { return `\`\`\`${type ?? "yml"}\n${text}\n\`\`\`` };
		
		let uptime = parseInt(process.uptime() * 1000);


      let embed = new EmbedBuilder()
      .setTitle(`${client.user.username}`)
      .addFields([
		globalFunc?.create?.embedField('> Latency', codeBlock('yaml', client.ws.ping+'ms')),
        globalFunc?.create?.embedField('> Uptime', codeBlock('yaml', ms(uptime))),		  
	  ])
      .setColor('Random')
	  
	  message.channel.send({ embeds: [embed] })

//=================
    }
    catch(e)
    {
      globalFunc?.logger(e)
	  console.log(e)
    }      
//=================
  }
}
