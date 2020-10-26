const krakenBase = 'https://api.twitch.tv/kraken/';
const krakenClientID = '4g5an0yjebpf93392k4c5zll7d7xcec';
const { request } = require ('./Fetch.js');

function kraken(opts) {
	let defaults = {
			base: krakenBase,
			headers: {
				'Client-ID': process.env.CLIENTID,
				Accept: 'application/vnd.twitchtv.v5+json'
			}
		};
	return request(Object.assign(defaults, opts));
};

module.exports = {
    kraken: kraken
};