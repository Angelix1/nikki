const { WebhookClient, EmbedBuilder } = require('discord.js');
const { stripIndents, oneLine } = require('common-tags');
const fs = require('fs');
const path = `${process.cwd()}/utils/`;

module.exports = function (type, client, reason, nonError = false) {
	// console.log(reason)
	
	if(process.env.crashHook) {
		const Webhook = new WebhookClient({
			url: process.env.crashHook?.toString(),
		});

		if(reason.length > 1800) {
			fs.writeFile(
				`${path}/error.txt`, 
				stripIndents`
				Type	: ${type}      
				Date    : ${new Date().toLocaleTimeString()}
				${reason}
				`,
				function (err) {
					if (err) return console.error(err);
				}
			);
			return Webhook.send({
				username: `${client.user?.username || ''} Logger`,
				avatarURL: client.user?.displayAvatarURL?.(),
				files: [
					{
						attachment: `${path}/error.txt`,
					},
				],
			});
		}

		if(nonError) {
			let embed = new EmbedBuilder()
			.setTitle('General Logger')
			.setDescription(stripIndents`
			\`\`\`js
			Type    : ${type}
			\`\`\`
   			${reason}
   			`)
			.setColor('Random')
			.setTimestamp()

			return Webhook.send({
				username: `${client.user?.username || ''} Logger`,
				avatarURL: client.user?.displayAvatarURL?.(),
				embeds: [embed],
			});
		}

		let embed = new EmbedBuilder()
		.setTitle('Error')
		.setDescription(stripIndents`
	\`\`\`js
	Type    : ${type}
	${reason}
	\`\`\``)
		.setColor('Red')
		.setTimestamp()

		return Webhook.send({
			username: `${client.user?.username || ''} Logger`,
			avatarURL: client.user?.displayAvatarURL?.(),
			embeds: [embed],
		});
	}
	else {
		console.log('No Webhook')
		console.log(reason)
	}
};
