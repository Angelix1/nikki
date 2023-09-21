const fs = require('fs');
const { Client, Partials, GatewayIntentBits, Collection, LimitedCollection, ActivityType  } = require('discord.js');

const config = require('./config')

const client = new Client({
	partials: [ Partials.Message, Partials.GuildMember ],
	presence: {
		activities: [{
            type: ActivityType.Custom,
            name: "Hi", // name is exposed through the API but not shown in the client for ActivityType.Custom
            state: "Nikki here..."
        }],
		// [{ name: defaultprefix + 'help', type: 2 }],
		status: 'online',
	},
	intents: Object.entries(GatewayIntentBits).filter(x => !isNaN(Number(x[0]))).map(x => x[1]),
	makeCache: (manager) => {
		if (manager.name === 'MessageManager') return new LimitedCollection({ maxSize: 20 });
		return new Collection();
	},
});

client.login(config?.token ?? process.env.TOZKEN).then(
	() => console.log('login')
)