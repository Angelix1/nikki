let { readdirSync } = require('fs');

module.exports = {
	name: 'legacyLoader',
	listener: 'ready',
	async run(client) {
		let path = process.cwd() + '/cmd_legacy';

		const commandFolders = readdirSync(path);

		for (const folder of commandFolders) {
			const commandFiles = readdirSync(`${path}/${folder}`).filter((file) =>
				file.endsWith('.js')
			);
			const FILES = readdirSync(`${path}/${folder}`);

			if (FILES.length > 0) {
				console.log(`Legacy: ${folder}: ${FILES.join(', ').replace(/\.js/gi, '')}`);
			}

			for (const file of commandFiles) {
				const command = require(`${path}/${folder}/${file}`);
				client.commands.set(command.name, command);
			}
		}
	},
};