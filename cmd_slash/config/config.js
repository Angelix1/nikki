const {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ButtonBuilder,
	EmbedBuilder,
	ButtonStyle,
	ApplicationCommandType,
	ApplicationCommandOptionType,
	ModalBuilder,
	TextInputBuilder,
} = require('discord.js');

const { stripIndents, oneLine } = require('common-tags');
const { choiceField } = globalFunc.create;
const { AsciiTable3, AlignmentEnum } = require('ascii-table3');

module.exports = {
	data: {
		name: 'config',
		description: "Configure Nikki's settings",
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
				name: 'set',
				description: 'set certain keys',
				type: ApplicationCommandOptionType.SubcommandGroup,
				options: [
					{
						name: 'logging',
						description: 'Nikki loggings',
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: 'type',
								description: 'Configuration type',
								type: ApplicationCommandOptionType.String,
								required: true,
								choices: [
									choiceField('Verification Logging', 'verification_log'),
									choiceField('General Logging', 'general_log'),
								],
							},
							{
								name: 'channel',
								description: 'Channel where the bot logs said type',
								type: ApplicationCommandOptionType.Channel,
								required: true,
							},
						],
					},
					{
						name: 'role',
						description: 'Give role automatically for approved verification or set Staff role',
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: 'type',
								description: 'Target type',
								type: ApplicationCommandOptionType.String,
								required: true,
								choices: [
									choiceField('Member Role', 'member_role'),
									choiceField('Staff Role', 'staff_role'),
									choiceField('Verification Pending Role', 'verification_pending_role'),
								]
							},
							{
								name: 'role',
								description: 'role that will be given',
								type: ApplicationCommandOptionType.Role,
								required: true
							}
						]
					}
				],
			},
			{
				name: "view",
				description: "list configs",
				type: ApplicationCommandOptionType.Subcommand,
				options: []
			}
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
	dev: false,
	async run(client, int) {
		try {
			const SE = globalFunc?.sendEphemeral;

			const isAdmin = int?.member?.permissions
				?.toArray?.()
				?.some((x) => x == 'Administrator');
			if (isAdmin == null) {
				return int.reply(SE(`Missing Permissions, Required \`${Administrator}\``));
			}

			const ENUM = {
				verification_log: 'Verification Logging',
				general_log: 'General Logging',
				staff_role: 'Staff Role',
				member_role: 'Member Role',
				verification_pending_role: 'Verification Pending Role'
			}
			
			const subCommandGroup = int.options.getSubcommandGroup();
			const subCommand = int.options.getSubcommand();

			const db = await mongodb?.db('nikki');
			const coll = db.collection('setting');

			if(subCommand == 'view') {
				const Data = await coll.find({ server_id: int.guildId })?.toArray();
				
				// console.log(Data)
				
				if(Data[0]) {
					
					let str = '';
					
					Object.entries(Data[0]).map(x => {
						if([
							'_id',
							'server_id',
							'server_name'
						].some(flag => x[0] == flag)) return;
						
						const title = ENUM[ x[0] ];
						const desc = x[0].includes('role') ? '<@&'+x[1]+'>' : '<#'+x[1]+'>';
						
						str += `> **${ title }**\n${ desc }\n\n`
					})
					
					
					const Embed = new EmbedBuilder()
					.setTitle(`${int?.guild?.name || '' } Configuration`)
					.setDescription(str)
					.setColor('Random')

					return int.reply({ embeds: [Embed] })
				}
				
				return int.reply('Data Unavailable')
			}
			
			if (subCommandGroup == 'set') {
				
				const Embed = new EmbedBuilder();
				let Doc = {
					server_name: int.guild.name,
					server_id: int.guildId
				};
				
				if (subCommand == 'logging') {
					const inputType = int.options.getString('type');
					const inputChannel = int.options.getChannel('channel');
					
					if (inputChannel?.type == 0 && inputChannel.id) {
						Doc[inputType] = inputChannel?.id
						
						await coll.updateOne(
							{ server_id: int.guildId }, 
							{ $set: Doc }, 
							{ upsert: true }
						)
						
						return int.reply({ 
							embeds: [
								Embed
								.setTitle("Config Updated")
								.setDescription(`\`${ENUM[inputType]}\` Updated to ${inputChannel}`)
								.setColor('Random')
							] 
						});
					} 
					else {
						return int.reply({
							embeds: [
								Embed
								.setTitle('Error')
								.setColor('Red')
								.setDescription(
									`Given Channel (${inputChannel}) is not GuildText channel.`
								),
							],
						});
					}
				}
				if (subCommand == 'role') {
					const inputType = int.options.getString('type');
					const inputRole = int.options.getRole('role');
					Doc[inputType] = inputRole?.id

					await coll.updateOne(
						{ server_id: int.guildId }, 
						{ $set: Doc }, 
						{ upsert: true }
					)

					return int.reply({ 
						embeds: [
							Embed
							.setTitle("Config Updated")
							.setDescription(`\`${ENUM[inputType]}\` Updated to ${inputRole}`)
							.setColor('Random')
						] 
					});
				}
			}
			
			
		} catch (e) {
			console.log(e.stack);
			globalFunc?.logger('[Slash Command]', client, e.stack);
		}
	},
};
