let Discord = require('discord.js');
let { stripIndents, oneLine } = require('common-tags');

module.exports = {
	name: 'legacy',
	listener: 'messageCreate',
	async run(client, message) {
		if (message.type == 18 || message.author.bot) return;
		if (message.channel.type === 1) {
			return;
			//sendEmbed()
		}
		
		if(client.commands.length < 1 || client.commands.size < 1) return;

		let Devs = client.devs; // index.js
		let cooldowns = client.cooldown; // index.js

		let prefix,
			spl = message.content.split(' ');
		prefix = (client.prefix && client.prefix[message.guild.id]) ?? '..';

		/* default_prefix can be found in functions/botDefaultConfig */

		if ((spl.length == 1 && spl[0].replace(/(<|!|@|>)/gi, '')) == client.user.id) {
			return message.channel.send({
				content: `Hey my prefix is \`${prefix}\``,
			});
		}

		client.prefix = prefix;

		if (!message.content.toLowerCase().startsWith(prefix)) return;

		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const commandName = args.shift().toLowerCase();

		// afk code insert here
		let command =
			client.commands.get(commandName) ||
			client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
		if (command) {
			// blacklist here
			// command toggle here

			//━━━━━━━━━━━━━━ [ Dev bypass ] ━━━━━━━━━━━━━━━
			if (Devs.some((id) => id == message.author.id)) {
				//━━━━━━━━━━━━━━ [ args check ] ━━━━━━━━━━━━━━━
				if (command.argsRequired && !args.length) {
					if (command.usage && command.usage.length >= 1) {
						let Arguments = '';
						let pr = Array.isArray(prefix) ? prefix[0] : prefix;
						let Use = `${pr}${command.name}`;

						Arguments += `Missing Arguments\nCommand Usage:\n${Use} ${command.usage.join(
							`\n${Use} `
						)}\n`;

						if (command.aliases.length >= 1) {
							let allAlias = '';
							for (let alias of command.aliases) {
								let Alias = `${pr}${alias}`;

								allAlias += `${Alias} ${command.usage[0]}\n`;
							}
							Arguments += `\nUsing Aliases:\n${allAlias}`;
						}

						Arguments += `\n<> = Required | [] = Optional`;

						return message.reply(stripIndents`\`\`\`yaml
							${Arguments}
							\`\`\``);
					}
					if (!command.usage || command.usage.length < 1) {
						return message.reply('Please provide an arguments');
					}
				}
				return command.run(client, message, args);
			}
			
			//━━━━━━━━━━━━━━ [ devsOnly ] ━━━━━━━━━━━━━━━
			if (command.devsOnly && !Devs.includes(message.author.id)) return false;

			//━━━━━━━━━━━━━━ [ WIP check ] ━━━━━━━━━━━━━━━
			if (command.wip && command.wip == true) {
				return message.channel.send({
					content: `This command is still in Work In Progress. It'll be unuseable for now.`,
				});
			}

			//━━━━━━━━━━━━━━ [ User permissions ] ━━━━━━━━━━━━━━━
			if (
				command.userPermissions &&
				command.userPermissions.length > 0 &&
				!Teams.includes(message.author.id)
			) {
				if (Array.isArray(command.userPermissions)) {
					let missingPerms = [];
					for (let perm of command.userPermissions) {
						if (Boolean(message.member.permissions.has(perm.toUpperCase())) == false) {
							missingPerms.push(permissions[perm]);
						}
						// continue;
					}

					let PH = oneLine`
            You need the following permissions for the \`${command.name}\` command to work:
            \`${missingPerms.join('`, `')}\`
          `;

					if (missingPerms.length > 0) {
						return message.channel.send({ content: PH });
					}
				}
			}

			//━━━━━━━━━━━━━━ [ Client permissions ] ━━━━━━━━━━━━━━━
			if (command.clientPermissions && command.clientPermissions.length > 0) {
				if (Array.isArray(command.clientPermissions)) {
					let missingPerms = [];
					for (let perm of command.clientPermissions) {
						if (
							Boolean(message.guild.me.permissions.has(perm.toUpperCase())) == false
						) {
							missingPerms.push(permissions[perm]);
						}
						// continue;
					}

					let PH = oneLine`
            I need the following permissions for the \`${command.name}\` command to work:
            \`${missingPerms.join('`, `')}\`
          `;
					if (missingPerms.length > 0) {
						return message.channel.send({ content: PH });
					}
				}
			}
			
			// console.log(args.length, !args.length)
			//━━━━━━━━━━━━━━ [ args check ] ━━━━━━━━━━━━━━━
			if (command.argsRequired && !args.length) {
				if (command.usage && command.usage.length >= 1) {
					let Arguments = '';
					let pr = Array.isArray(prefix) ? prefix[0] : prefix;
					let Use = `${pr}${command.name}`;

					Arguments += `Missing Arguments\nCommand Usage:\n${Use} ${command.usage.join(
						`\n${Use} `
					)}\n`;

					if (command.aliases.length >= 1) {
						let allAlias = '';
						for (let alias of command.aliases) {
							let Alias = `${pr}${alias}`;

							allAlias += `${Alias} ${command.usage[0]}\n`;
						}
						Arguments += `\nUsing Aliases:\n${allAlias}`;
					}

					Arguments += `\n<> = Required | [] = Optional`;

					return message.reply(stripIndents`\`\`\`yaml
						${Arguments}
						\`\`\``);
				}
				if (!command.usage || command.usage.length < 1) {
					return message.reply('Please provide an arguments');
				}
			}

			//━━━━━━━━━━━━━━ [ cooldown ] ━━━━━━━━━━━━━━━

			if (!cooldowns.has(command.name)) {
				cooldowns.set(command.name, new Discord.Collection());
			}

			const now = Date.now();
			const timestamps = cooldowns.get(command.name);
			const cooldownAmount = (command.cooldown || 5) * 1000;

			if (timestamps.has(message.author.id)) {
				const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;
					return message.reply({
						content: `Please wait ${timeLeft.toFixed(
							1
						)} more second(s) before reusing the \`${command.name}\` command.`,
					});
				}
			}

			timestamps.set(message.author.id, now);
			setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

			//━━━━━━━━━━━━━━ [ run ] ━━━━━━━━━━━━━━━
			try {
				command.run(client, message, args).catch((e) => {
					print(e);
					message.channel.send(`Error: ${e.message}`);
				});
			} catch (e) {
				await message.channel.send(e.message.toString());
				return console.log(e);
			}
		}
		//end
	},
};
