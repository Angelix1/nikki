module.exports = {
	name: 'autoComplete',
	listener: 'interactionCreate',
	async run(client, int) {
		if (int.isAutocomplete()) {
			console.log(int.options._hoistedOptions);
			let cmds = client.slashCommands;
			let createAC = (name, value) => {
				return { name, value };
			};

			let CommandOptions = int.options._hoistedOptions;
			if (!CommandOptions) return;

			let filter = (target) => {
				return CommandOptions.find((c) => c.name == target);
			};

			// Reloads
			if (filter('command_name')) {
				let data = filter('command_name');
				let createAC = (name, value) => {
					return { name, value };
				};
				let commandsName = cmds.map((c) => c.data.name);
				let ACL = [];

				commandsName.forEach((x) => {
					if (x.includes(data.value)) {
						ACL.push(createAC(x, x));
					}
				});
				return int.respond(ACL);
			}
			if (filter('event_name')) {
				let data = filter('event_name');
				let createAC = (name, value) => {
					return { name, value };
				};
				let Events = client.events.map((c) => c.name);
				let ACL = [];

				Events.forEach((x) => {
					if (x.includes(data.value)) {
						ACL.push(createAC(x, x));
					}
				});
				return int.respond(ACL);
			}
			
			// end
		}
	},
};
