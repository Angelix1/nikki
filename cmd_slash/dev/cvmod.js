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
	TextInputStyle,
} = require('discord.js');

const { stripIndents, oneLine } = require('common-tags');

module.exports = {
	data: {
		name: 'cvmod',
		description: 'cvmod',
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
				name: 'test',
				description: 'Test button',
				type: ApplicationCommandOptionType.Boolean
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
			if (!client.devs.some((u) => u == int.user.id))
				return int.reply(globalFunc.sendEphemeral('You are?'));
			
			const test = int.options.getBoolean('test');
			
			if(test) {
				
				const Embed = new EmbedBuilder()
				.setTitle('Click Button Below to verify')
				.setDescription(stripIndents`
				There'll be 2 step verification, each with 5 question, so in total it's 10 questions.
				
				If you encounter a problem with verification, either contact staff directly or open a ticket for alternative verification.
				`)
				.setColor('Random')
				
				const button = globalFunc.create.button('start_verification', 'Verify Here', 'success')
				
				const Arow = new ActionRowBuilder().addComponents([ button ])
				
				await int.guild.channels.cache.get(int.channelId).send({
					embeds: [Embed],
					components: [Arow]
				})
				
				return int.reply(globalFunc.sendEphemeral('Sent'))
			}	
			
			const modal = new ModalBuilder()
			.setCustomId('verification_modal_1')
			.setTitle('Verification Modal 1/2');

			// Create the text input components
			const one = new TextInputBuilder()
				.setCustomId('answer_1')
				.setLabel("What's your favorite color?")
				.setStyle(TextInputStyle.Short);
			
			const two = new TextInputBuilder()
				.setCustomId('answer_2')
				.setLabel("What's some of your favorite hobbies?")
				.setStyle(TextInputStyle.Paragraph);
			
			const three = new TextInputBuilder()
				.setCustomId('answer_3')
				.setLabel("What's your favorite color?")
				.setStyle(TextInputStyle.Short);
			
			const four = new TextInputBuilder()
				.setCustomId('answer_4')
				.setLabel("What's your favorite color?")
				.setStyle(TextInputStyle.Short);
			
			const five = new TextInputBuilder()
				.setCustomId('answer_5')
				.setLabel("What's your favorite color?")
				.setStyle(TextInputStyle.Short);
			
			
			one.setLabel(client.verificationQuestion[0])
			two.setLabel(client.verificationQuestion[1])
			three.setLabel(client.verificationQuestion[2])
			four.setLabel(client.verificationQuestion[3])
			five.setLabel(client.verificationQuestion[4])
			
			const oneRow = new ActionRowBuilder().addComponents(one);
			const twoRow = new ActionRowBuilder().addComponents(two);
			const threeRow = new ActionRowBuilder().addComponents(three);
			const fourRow = new ActionRowBuilder().addComponents(four);
			const fiveRow = new ActionRowBuilder().addComponents(five);
				
			modal.addComponents(oneRow, twoRow, threeRow, fourRow, fiveRow);
			await int.showModal(modal);
			
		} catch (e) {
			console.log(e.stack);
			globalFunc?.logger('[Slash Command]', client, e.stack);
		}
	},
};