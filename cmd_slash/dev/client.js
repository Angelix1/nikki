
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
	ActivityType
} = require('discord.js');

const { stripIndents, oneLine } = require('common-tags');

const PremadeActivities = Object.entries(ActivityType)?.filter(x => x[0]?.length > 1)?.map(x => ({ name: x[0], value: x[1]?.toString() }))

module.exports = {
	data: {
		name: 'client',
		description: 'Modify Client',
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
				name: 'status',
				description: 'Change Client Status',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'type',
						description: 'Activity type',
						type: ApplicationCommandOptionType.String,
						required: true,
						choices: PremadeActivities
					},
					{
						name: "description",
						description: "Description for the status",
						type: ApplicationCommandOptionType.String,
						required: true
					}
				]
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
	dev: true,
	async run(client, int) {
		try {
			if (!client.devs.some((u) => u == int.user.id)) return int.reply({ content: 'You are?', ephemeral: true });
			
			const subC = int.options.getSubcommand();
			
			if(subC == 'status') {
				let Type = int.options.getString('type')
				let Description = int.options.getString('description')
				
				if(!ActivityType[Type]) Type = 0;
				
				let acts = {
					type: Number(Type)
				};
				
				if(ActivityType[Type] == 'Custom') {
					acts.name = Description
					acts.state = Description
				} else {
					acts.name = Description
				}
				
				console.log(acts)
			
				await client.user.setPresence({
					activities: [acts]
				})
				
				return int.reply(globalFunc?.sendEphemeral(`Client Status Changed to \`${ActivityType[Type]}\` with description \`${Description}\``))
			}
			
			
				
		} catch (e) {
			console.log(e.stack)
			globalFunc?.logger('[Slash Command]', client, e.stack)
		}
	},
};