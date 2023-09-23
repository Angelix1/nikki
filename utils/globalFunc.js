const { ButtonBuilder, SelectMenuBuilder, Util } = require('discord.js');
const Logger = require('./logger');
const cfg = require(process.cwd()+'/config')

async function verifyString(
	data,
	error = Error,
	errorMessage = `Expected a string, got ${data} instead.`,
	allowEmpty = true
) {
	if (typeof data !== 'string') throw new error(errorMessage);
	if (!allowEmpty && data.length === 0) throw new error(errorMessage);
	return data;
}

module.exports = {
	load: async (globalValue) => {
		globalValue.globalFunc = {}
		
		Object.defineProperties(globalValue?.globalFunc, {
			removeDuplicate: {
				value: function (array) {
					return Array.from(new Set(array).values())
				},
			},
			defaultprefix: {
				value: (cfg?.defaultprefix ?? process.env.defaultprefix) ?? '..',
			},
			print: {
				value: console.log,
			},
			logger: {
				value: async (type, client, reason) => {
					return Logger(type, client, reason);
				},
			},
			ago: {
				value: function ago(date) {
					if (!date) throw new ReferenceError('The date is not defined');
					let now = new Date();
					let diff = now.getTime() - date.getTime();
					let days = Math.floor(diff / 86400000);
					return days + (days == 1 ? ' day' : ' days') + ' ago';
				},
			},
			sleep: {
				value: function (ms) {
					if (!ms) throw new TypeError("Time isn't specified");
					return new Promise((resolve) => setTimeout(resolve, ms));
				},
			},
			sendEphemeral: {
				value: function(st) {
					if(typeof(st) == 'string') st = {content: st};
					return {
						...st,
						ephemeral: true
					}
				}
			},
			create: {
				value: {
					choiceField: (n, v) => {
						return { name: n, value: v }
					},
					embedField: (name, value, line) => {
						let liner = !line ? false : true;
						return { name, value, inline: liner };
					},
					button: function (id, label, style, emoji = null, disabled = false) {
						let buttonStyles = {
							primary: 1,
							secondary: 2,
							success: 3,
							danger: 4,
							link: 5,
						};
						let btn = new ButtonBuilder()
						.setCustomId(id)
						.setLabel(label)
						.setStyle(buttonStyles[style.toLowerCase()])
						.setDisabled(disabled);

						btn = !emoji ? btn : btn.setEmoji(emoji);

						return btn;
					},
					menu: function (id, placeholder, options = []) {
						return new SelectMenuBuilder()
							.setCustomId(id)
							.setPlaceholder(placeholder)
							.addOptions(options);
					},
				},
			},
			splitMessage: {
				value: async function (
					text,
					{ maxLength = 2_000, char = '\n', prepend = '', append = '' } = {}
				) {
					text = verifyString(text);
					text = await text;
					if (text.length <= maxLength) return [text];
					let splitText = [text];
					if (Array.isArray(char)) {
						while (
							char.length > 0 &&
							splitText.some((elem) => elem.length > maxLength)
						) {
							const currentChar = char.shift();
							if (currentChar instanceof RegExp) {
								splitText = splitText.flatMap((chunk) => chunk.match(currentChar));
							} else {
								splitText = splitText.flatMap((chunk) => chunk.split(currentChar));
							}
						}
					} else {
						// console.log(typeof text, text)
						splitText = text?.split(char);
					}
					if (splitText.some((elem) => elem.length > maxLength))
						throw new RangeError('SPLIT_MAX_LEN');
					const messages = [];
					let msg = '';
					for (const chunk of splitText) {
						if (msg && (msg + char + chunk + append).length > maxLength) {
							messages.push(msg + append);
							msg = prepend;
						}
						msg += (msg && msg !== prepend ? char : '') + chunk;
					}
					return messages.concat(msg).filter((m) => m);
				},
			},
			arrayToModule: {
				value: function(data) {
					if(!Array.isArray(data)) return { 
						msg: 'Data Must be Array',
						error: true
					};
					
  					const jsonString = JSON.stringify(data, null, 2);
  					const outputString = `module.exports = ${jsonString};\n`;
  					return outputString;
				}
			}
		});

		String.prototype.capitalize = function (split = ' ') {
			let str = this;
			if (!str) return false;
			return str
				.split(split)
				.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
				.join(' ');
		};
		String.prototype.zalgofied = function () {
			const obj = {
				a: '𝖺',
				b: '𝚋',
				c: '𝚌',
				d: '𝚍',
				e: '𝚎',
				f: '𝚏',
				g: '𝚐',
				h: '𝚑',
				i: '𝚒',
				j: '𝚓',
				k: '𝚔',
				l: '𝚕',
				m: '𝚖',
				n: '𝚗',
				o: '𝗈',
				p: '𝚙',
				q: '𝚚',
				r: '𝚛',
				s: '𝚜',
				t: '𝚝',
				u: '𝗎',
				v: '𝚟',
				w: '𝚠',
				x: '𝚡',
				y: '𝚢',
				z: '𝚣',
			};
			let string = this;
			for (var x in obj) string = string.replace(new RegExp(x, 'g'), obj[x]);
			return string;
		};

		Array.prototype.splitChunk = function (chunkSize) {
			let arr = this;
			if (!chunkSize) return arr;
			return [].concat.apply(
				[],
				arr.map(function (elem, i) {
					return i % chunkSize ? [] : [arr.slice(i, i + chunkSize)];
				})
			);
		};
		console.log(globalFunc)
		return true;
	},
};