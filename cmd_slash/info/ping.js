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

module.exports = {
	data: {
		name: 'ping',
		description: 'Bot\'s ping',
		type: ApplicationCommandType.ChatInput,
		/*
@type
ApplicationCommandType = {
  ChatInput  : Slash commands
  User       : A UI-based command that shows up when you right click or tap on a user
  Message    : A UI-based command that shows up when you right click or tap on a message
}
*/
		options: [],
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
			console.log(globalFunc)
			int.reply(globalFunc.sendEphemeral(`Hey ${client.ws.ping}ms`))
		} catch (e) {
			console.log(e.stack)
			globalFunc?.logger('[Slash Command]', client, e.stack)
		}
	},
};