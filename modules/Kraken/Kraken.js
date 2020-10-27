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

function getBadges(channel) {
	return kraken({
		base: 'https://badges.twitch.tv/v1/badges/',
		endpoint: (channel ? `channels/${channel}` : 'global') + '/display',
		qs: { language: 'en' }
	})
	.then(data => data.badge_sets);
}

function twitchNameToUser(username) {
	return kraken({
		endpoint: 'users',
		qs: { login: username }
	})
	.then(({ users }) => users[0] || null);
};

module.exports = {
	getBadges,
	twitchNameToUser
};