function removeDup(array) {
  return Array.from(new Set(array).values());
}

module.exports = {
	name: 'loadEvents',
	async handle(client) {
		let events = client.events;
		function Find(collected, type) {
			return collected.filter((e) => e.listener == type);
		}
		var load = {};
		let possibleEvents = removeDup(events.map(g => g.listener))
		
		possibleEvents.forEach((evt) => {
			var loadedEventList = {};
			let thisEvent = Find(events, evt);

			loadedEventList[evt] = thisEvent.map((x) => x.name);

			if (loadedEventList[evt].length > 0) {
				load[evt] = loadedEventList[evt].join(', ');
			}

			if (thisEvent.size >= 1) {
				client.on(evt, async (...args) => {
					// print(args)
					thisEvent.forEach(async (listen) => {
						let revent = client?.events?.get(listen?.name);
						// print(listen.name)
						try {
							revent.run(client, ...args);
						} catch (e) {
							print(e);
						}
					});
				});
			}
		});

		console.table(load);
	},
};