const {
	ActionRowBuilder,
	SelectMenuBuilder,
	ButtonBuilder,
	EmbedBuilder,
	ButtonStyle,
	ApplicationCommandType,
	ApplicationCommandOptionType,
	Options,
} = require('discord.js');

const { stripIndents, oneLine } = require('common-tags');
const fs = require('fs');

module.exports = {
	data: {
		name: 'reload',
		description: 'Reload Commands/ Events Collection',
		type: ApplicationCommandType.ChatInput,
		/*
    @type
    ApplicationCommandType = {
      ChatInput  : Slash commands
      User       : A UI-based command that shows up when you right click or tap on a user
      Message    : A UI-based command that shows up when you right click or tap on a message
    }
    */
		options: [
			{
				name: 'command',
				description: 'Reload slash command',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'command_name',
						description: 'Command',
						type: ApplicationCommandOptionType.String,
						required: true,
						autocomplete: true,
					},
				],
			},
			{
				name: 'event',
				description: 'Reload events',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'event_name',
						description: 'Event',
						type: ApplicationCommandOptionType.String,
						required: true,
						autocomplete: true,
					},
				],
			},
		],
	},
	/**
   * @this.client           - Bot
   * @name                  - Command Name or Class Command Name, STRING
   * @description           - Command Description, Max 100 chars
   * @type                  - {
      ApplicationCommandType.ChatInput
      ApplicationCommandType.ContextMenu
      
      }
   * @options.type          - {
        ApplicationCommandOptionType.Subcommand
        ApplicationCommandOptionType.SubcommandGroup 
        ApplicationCommandOptionType.String
        ApplicationCommandOptionType.Integer
        ApplicationCommandOptionType.Boolean
        ApplicationCommandOptionType.User
        ApplicationCommandOptionType.Channel
        ApplicationCommandOptionType.Role
        ApplicationCommandOptionType.Mentionable
        ApplicationCommandOptionType.Number
      }
  * @options               - Command Options, Array[Object]
  * @options.type          - Refer to @type
  * @options.value         - input from users, 
  * @options.focused       - true if this option is the currently focused option for autocomplete 
  * @options.autocomplete  - Boolean
  * @options.choices       - Command Options Choices, Object{ name, value }

  */
	dev: true,
	async run(client, int) {
		if (!client.devs.some((u) => u == int.user.id)) return int.reply('You are?');

		let Check = '✅';
		let XNO = '❌';

		let subCommand = int.options.getSubcommand();

		if (subCommand == 'command') {
			let command = int.options.getString('command_name');
			const SlashFolders = await fs.promises
				.readdir(`${process.cwd()}/cmd_slash`)
				.catch((err) => {
					return console.log(err);
				});

			const Fail = new EmbedBuilder().setTitle(`${XNO} Fail`).setColor('Red');

			const Success = new EmbedBuilder().setTitle(`${Check} Success`).setColor('Green');

			try {
				for (const subFolder of SlashFolders) {
					const file = await fs.promises
						.readdir(`${process.cwd()}/cmd_slash/${subFolder}`)
						.catch((err) => {
							return console.log(err);
						});

					const CMD = client.slashCommands.get(command);

					if (!CMD) {
						return int.reply({
							embeds: [
								Fail.setDescription(
									`There is no Slash Commands with name \`${command}\``
								),
							],
							ephemeral: true,
						});
					}

					if (file.includes(`${CMD.data.name}.js`)) {
						try {
							let path = `../${subFolder}/${CMD.data.name}.js`;
							const tempCommand = require(path);
							let newCommand;
							try {
								await client.slashCommands.set(
									tempCommand.data.name + '1',
									tempCommand
								);
								newCommand = tempCommand;
								await client.slashCommands.delete(tempCommand.data.name + '1');
							} catch (e) {
								return int.reply({
									embeds: [
										Fail.setDescription(
											`There was an error while reloading a CMD \`${command}\`:\n\`${e.message}\``
										),
									],
									ephemeral: true,
								});
							}

							delete require.cache[require.resolve(path)];
							client.slashCommands.delete(command);

							client.slashCommands.set(newCommand.data.name, newCommand);
							return int.reply({
								embeds: [
									Success.setDescription(
										`\`${command}\` has been succesfully reloaded`
									),
								],
								ephemeral: true,
							});
						} catch (error) {
							return int.reply({
								embeds: [
									Fail.setDescription(
										`There was an error while reloading a CMD \`${command}\`:\n\`${error.message}\``
									),
								],
								ephemeral: true,
							});
						}
						break;
					}
				}
			} catch (error) {
				return int.reply({
					content: `${XNO} There was an error trying to reload **${command}**: \`${error.message}\``,
					ephemeral: true,
				});
			}
		}
		//====================
		if (subCommand == 'event') {
			let Event = int.options.getString('event_name');

			const EventsFolders = await fs.promises
				.readdir(`${process.cwd()}/events`)
				.catch((err) => {
					return console.log(err);
				});

			const Fail = new EmbedBuilder().setTitle(`${XNO} Fail`).setColor('Red');

			const Success = new EmbedBuilder().setTitle(`${Check} Success`).setColor('Green');

			try {
				for (const subFolder of EventsFolders) {
					const file = await fs.promises
						.readdir(`${process.cwd()}/events/${subFolder}`)
						.catch((err) => {
							return console.log(err);
						});

					const targetEvent = client.events.get(Event);

					if (!targetEvent) {
						return int.reply({
							embeds: [
								Fail.setDescription(
									`There is no Event with name \`${targetEvent}\``
								),
							],
							ephemeral: true,
						});
					}

					if (file.includes(`${targetEvent.name}.js`)) {
						try {
							let path = `${process.cwd()}/events/${subFolder}/${
								targetEvent.name
							}.js`;
							const temp = require(path);
							let newEvent;
							try {
								await client.events.set(temp.name + '1', temp);
								newEvent = temp;
								await client.events.delete(temp.name + '1');
							} catch (e) {
								return int.reply({
									embeds: [
										Fail.setDescription(
											`[Temp] There was an error while reloading a event \`${Event}\`:\n\`\`\`yaml\n${e}\n\`\`\``
										),
									],
									ephemeral: true,
								});
							}

							client.events.delete(targetEvent);
							delete require.cache[require.resolve(path)];

							client.events.set(newEvent.name, newEvent);
							return int.reply({
								embeds: [
									Success.setDescription(
										`\`${Event}\` has been succesfully reloaded`
									),
								],
								ephemeral: true,
							});
						} catch (error) {
							return int.reply({
								embeds: [
									Fail.setDescription(
										`[Set] There was an error while reloading a event \`${Event}\`:\n\`\`\`yaml\n${error}\n\`\`\``
									),
								],
								ephemeral: true,
							});
						}
						break;
					}
				}
			} catch (error) {
				return int.reply({
					content: `${XNO} There was an error trying to reload **${Event}**: \`${error.message}\``,
					ephemeral: true,
				});
			}
		}

		//====================
	},
};