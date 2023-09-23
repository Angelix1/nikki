const fs = require('fs');
const { Client, Partials, GatewayIntentBits, Collection, LimitedCollection, ActivityType  } = require('discord.js');

const requiredIntents = require('./intents');
const config = require('./config');
const eventPath = process.cwd() + '/events';
const CustomEventFolder = fs.readdirSync(eventPath);
const tempEvents = [];

for (const subfolder of CustomEventFolder) {
	const eventFiles = fs.readdirSync(`${eventPath}/${subfolder}`).filter((file) => file.endsWith('.js'));
	for (const file of eventFiles) {
		const event = require(`${eventPath}/${subfolder}/${file}`);
		if (!event || !event.listener) {
			continue;
		}
		// console.log(event.listener)
		tempEvents.push(event);
	}
}
/*
function ParseNeededIntents(event, additionalIntents = [], debug) {
	function removeDup(array) { 
		return Array.from(new Set(array).values())
	};

	const listeners = event.map(temp => temp.listener);
		
	let Raw = listeners.map(int => requiredIntents[int] );
	Raw = removeDup(...Raw);
	
	Raw.push(...additionalIntents)
	const parsed = removeDup(Raw);
	if(debug) {
		console.log(parsed)
	}
	return parsed
}

const ClientIntents = ParseNeededIntents(
	tempEvents, 
	['GuildMembers', 'GuildPresences'], 
	true
)
*/

const client = new Client({
	partials: [ Partials.Message, Partials.GuildMember ],
	presence: {
		activities: [{
            type: ActivityType.Custom,
            name: "Hi", // name is exposed through the API but not shown in the client for ActivityType.Custom
            state: "Nikki here..."
        }],
		status: 'online',
	},
	intents: Object.entries(GatewayIntentBits).filter(x => !isNaN(Number(x[0]))).map(x => x[1]),
	makeCache: (manager) => {
		if (manager.name === 'MessageManager') return new LimitedCollection({ maxSize: 20 });
		return new Collection();
	},
});

client.login(config?.tozken ?? process.env.TOZKEN)


client.categories = fs.readdirSync(process.cwd() + '/cmd_legacy');
client.commands = new Collection();
client.events = new Collection();
client.slashCommands = new Collection();
client.cooldown = new Collection();
client.owner = '692632336961110087';
client.devs = ['692632336961110087'];
client.verify = new Collection();
client.verificationQuestion = [
	"Why do you want to join this server?",
	"Where you find the server?",
	"How old are you?",
	"Tell us a little bit about yourself.",
	"What does the term \"furry\" mean to you?",	
	"What does \"fursona\" mean?",
	"Do you have hobbies?",
	"Do you have a fursona? if so describe it.",
	"Do you agree to our server's rules?",
	"What's the sekret keyword?"
];

global.simpleDB = false;

tempEvents.forEach(x => client.events.set(x.name, x));
delete tempEvents;



require('./utils/globalFunc').load(global);
require('./utils/loadEvents').handle(client); 
require('./utils/loadMongo').init(global);
require('./utils/globalErrorHandler').init(process, client);