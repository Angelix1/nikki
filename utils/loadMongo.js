const { MongoClient } = require("mongodb");
const cfg = require(process.cwd()+'/config')

const MongoPath = cfg?.mongodb ?? process.env.mongoPath;

module.exports = {
	init: async (gl) => {
		if(MongoPath) {
			const client = new MongoClient(MongoPath);
			let db;
			try {
				db = await client.connect();
				console.log('MONGO CONNECTED')
			}
			catch(e) {
				console.log(e)
			}

			gl.mongodb = db;
		}
	},
};