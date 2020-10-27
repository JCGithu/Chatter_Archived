const { request } = require ('./Fetch.js');

function getBTTVEmotes(bttvEmoteCache, channel) {
	let endpoint = 'emotes';
	let global = true;
	if(channel) {
		endpoint = 'channels/' + channel;
		global = false;
	}
	return request({
		base: 'https://api.betterttv.net/2/',
		endpoint
	})
	.then(({ emotes, status, urlTemplate }) => {
		if(status === 404) return;
		bttvEmoteCache.urlTemplate = urlTemplate;
		emotes.forEach(n => {
			n.global = global;
			n.type = [ 'bttv', 'emote' ];
			if(!global) {
				if(channel in bttvEmoteCache.data === false) {
					bttvEmoteCache.data[channel] = [];
				}
				bttvEmoteCache.data[channel].push(n);
			}
			else {
				bttvEmoteCache.data.global.push(n);
			}
        });
        return bttvEmoteCache
	});
}

module.exports = {
    getBTTVEmotes
};