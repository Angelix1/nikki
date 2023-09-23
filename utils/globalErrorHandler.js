module.exports = {
	init: async function (process, client) {
		let sendToErrorLogger = require('./logger');

		process.on('unhandledRejection', async (reason, promise) => {
			sendToErrorLogger(
				'unhandledRejection',
				client,
				`Reason	: ${!reason.stack ? reason : reason.stack}`
			);
		});

		process.on('uncaughtException', async (err, origin) => {
			sendToErrorLogger(
				'uncaughtException',
				client,
				`Caught exception: ${err}\n\nException origin: ${origin}`
			);
		});

		process.on('uncaughtExceptionMonitor', async (err, origin) => {
			sendToErrorLogger('uncaughtExceptionMonitor', client, `Origin: ${origin}`);
		});

		/* Multiple Resolves 
		process.on("multipleResolves", async (type, promise, reason) => {
		  sendToErrorLogger(
			'multipleResolves', client, 
			`Type: ${type}\nReason: ${reason}`
		  )
		 });*/

		// Rejection Handled
		process.on('rejectionHandled', async (event) => {
			let tmp = '';
			if (typeof event == 'object') {
				for (let [key, val] of Object.entries(event)) {
					tmp += key + ' | ' + val + '\n';
				}
			} else if (typeof event == 'string') {
				tmp += event.toString();
			} else if (tmp.length < 1) {
				tmp += event.toString();
			}

			sendToErrorLogger('rejectionHandled', client, `\n${tmp}`);
		});
	},
};