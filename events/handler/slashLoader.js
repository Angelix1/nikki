let { readdirSync } = require('fs');
let { guilds } = require(`${process.cwd()}/config`);


module.exports = {
	name: 'slashLoader',
	listener: 'ready',
	async run(client, int) {
		let commands = [];

		let path = process.cwd() + '/cmd_slash';

		const slashyFolders = readdirSync(path);

		for (const folder of slashyFolders) {
			const commandFiles = readdirSync(`${path}/${folder}`).filter((file) =>
				file.endsWith('.js')
			);

			const FILES = readdirSync(`${path}/${folder}`);

			for (const file of commandFiles) {
				const command = require(`${path}/${folder}/${file}`);
				// console.log(command)
				if (!command || !command.data) {
					continue;
				}
				client.slashCommands.set(command.data.name, command);
				commands.push(command.data);
			}
		}
		if(!guilds.length) {
			console.log('NO Guilds for Slash')
		}
		guilds.forEach((guild) => {
			client.application.commands.set(commands, guild);
		})

		console.log(`[BOT] SLASH LOADED`);
	},
};