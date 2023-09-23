let Discord = require('discord.js');
let { stripIndents, oneLine } = require('common-tags');

module.exports = {
	name: 'ready',
	listener: 'ready',
	async run(client) {
		console.log(client.user.tag+' is Ready!')
	}
}