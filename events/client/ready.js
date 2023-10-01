let Discord = require('discord.js');
let { stripIndents, oneLine } = require('common-tags');

module.exports = {
	name: 'ready',
	listener: 'ready',
	async run(client) {
		console.log(client.user.tag+' is Ready!')
		globalFunc.logger(
			'Client Ready', 
			client, 
			`${client.user.username ?? client.user.tag} is Running.\n Initialized: <t:${Math.round(Date.now()/1000)}:R>`,
			true
		)
	}
}
