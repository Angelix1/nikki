const { stripIndents, oneLine } = require('common-tags');

module.exports = {
	name: 'slash',
	listener: 'interactionCreate',
	async run(client, int) {
		if (!int.isCommand()) return;

		const command = client.slashCommands.get(int.commandName);
		// console.log(command)
		
		if (!command) return;
		
		if (command.dev && client.devs.includes(int.user.id)) {
			try {
				await command.run(client, int);
				console.log(int.user.tag + ' [ Slash: ' + command.data.name + ` ]`);
			} catch (error) {
				console.error(error);
				await int.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			}
			return;
		}

		if (command.dev && !client.devs.includes(int.user.id)) {
			return int.reply({ content: 'Command Only For Developers', ephemeral: true });
		}
		
		if(simpleDB) {
			const cmdConf = await simpleDB.get(`chl_${int?.guildId}`);		
			
			let isAdmin = int?.member?.permissions?.toArray?.()?.some((x) => x == 'Administrator');
			if (isAdmin == null) isAdmin = false;

			if (cmdConf?.bl?.status == true && int.guildId != null && !isAdmin) {
				let st = false;

				if (cmdConf?.bl?.channel?.some((x) => x == int?.channelId)) st = true;

				let CHNL = await int?.member?.guild?.channels?.fetch(int.channelId);
				if (cmdConf?.bl?.category?.some((x) => x == CHNL?.parentId) && st == false) st = true;

				if (st) {
					let defaul = cmdConf?.defaultCh;

					let def = defaul?.map((x) => {
						return `<#${x}>`;
					});

					return int.reply({
						content: stripIndents`
						You cannot use command here. ${def.length > 0 ? `Use it on ${def?.join(', ')}` : ''}
						`,
						ephemeral: true,
					});
				}
			}
		}
		
		
		
		try {
			await command.run(client, int);
			console.log(int.user.tag + ' [ Slash: ' + command.data.name + ` ]`);
		} catch (error) {
			console.error(error);
			await int.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	},
};