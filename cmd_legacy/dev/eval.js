const {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ButtonBuilder,
	EmbedBuilder,
	ButtonStyle,
} = require('discord.js');

const { stripIndents, oneLine } = require('common-tags');

module.exports = {
	name: 'eval',
	description: 'evaluate SHIT',
	aliases: ['e'],
	category: 'devs',
	devsOnly: true,
	userPermissions: [],
	clientPermissions: [],
	details: [],
	cooldown: 5, // seconds
	usage: ['<things>'], // if argsRequired is true then this param required
	argsRequired: true,
	wip: false,

	async run(client, message, args) {
		try {
			
			// vars
			let msg = message;
			var MessageId = msg.id;
			
			// functions
			let Evaluated = async (_) => {
				if (_.startsWith('```') && _.endsWith('```'))
					_ = _.replace(/(^.*?\s)|(\n.*$)/g, '');

				const code = _;

				let arr = [];

				try {
					let evaled;

					if (code.includes('await')) evaled = eval(`( async () => { ${code} })()`);
					else evaled = eval(code);

					const Outputyes = await wildCardReplace(client, evaled);
					let Splitted = await globalFunc?.splitMessage(Outputyes, { maxLength: 1800 });
					
					console.log(typeof Splitted, Splitted)

					for (let cont of Splitted) {
						let embed = new EmbedBuilder()
							.setColor("Random")
							.setDescription('```js\n' + cont + '\n```');
						arr.push(embed);
						// print(Splitted)
					}
				} catch (e) {
					let embed = new EmbedBuilder()
						.setColor("Random")
						.setDescription(CleanError(e.message));
					arr.push(embed);
				}
				return arr;
			}

			const sendMultiple = async (out) => {
				let spit = globalFunc?.splitMessage(out, { maxLength: 1800 });

				for (let kont of spit) {
					message.channel.send('```js\n' + kont + '\n```');
				}
			}

			let wildCardReplace = async(client, text) => {
				if (text && text.constructor.name == 'Promise') text = await text;
				if (typeof text !== 'string') text = require('util').inspect(text, { depth: 1 });

				text = text
					.replace(/`​/g, '`​' + String.fromCharCode(8203))
					.replace(/@​/g, '@​' + String.fromCharCode(8203));
				text = text.replaceAll(client.token, 'Redacted goes BRRRRR');
				return text;
			}

			const CleanError = (text) => {
				print(typeof text);
				if (typeof text === 'string') {
					text = text
						.replace(/`/g, '`' + String.fromCharCode(8203))
						.replace(/@/g, '@' + String.fromCharCode(8203));
					text = text.replaceAll(client.token, 'nice try lul');
					return text;
				} else if (typeof text == 'object') return '[object Object]';
				else {
					text = text.replaceAll(client.token, 'it seems that its a wildcard');
					return text;
				}
			};

			let removeDup = (array) => {
				return Array.from(new Set(array).values());
			};

			
			// Runs
			try {
				let MSG = args.join(' ');

				if (MSG.startsWith('```') && MSG.endsWith('```'))
					MSG = MSG.replace(/(^.*?\s)|(\n.*$)/g, '');

				let result = await Evaluated(MSG);

				await message.channel
					.send({ embeds: removeDup(result) })
					.catch(
						async (err) => await sendMultiple(await wildCardReplace(client, eval(MSG)))
					);
			} catch (err) {
				message.channel.send({ content: `\`xl\` \`\`\`xl\n${CleanError(err)}\n\`\`\`` });
			}

			//=================
		} catch (e) {
			console.log(e)
      globalFunc?.logger(e);      
		}
		//=================
	},
};
