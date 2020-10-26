const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();
const twemoji = require('twemoji');
const fetch = require('node-fetch');

global.fetch = fetch
global.Headers = fetch.Headers;

const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: './data.db',
    },
    useNullAsDefault: true,
});

//EXPRESS
const express = require('express');
const app = express();
const server = app.listen(3000, () => {
    console.log('Server listening...')
});
app.use(express.static('public'));

//SOCKET.IO
var socket = require('socket.io');
var io = socket(server);
io.sockets.on('connection', newConnection);
io.sockets.on('disconnect', function() {io.sockets.disconnect();});

var useColor = true, 
    showBadges = true,
    showEmotes = true,
    doTimeouts = true;

const tmi = require('tmi.js');
const opts = {
    identity: {
        username: 'colloquialbot',
        password: process.env.OAUTH3
    },
    channels: ['colloquialowl']
};

var cooldown = ['nightbot', 'colloquialbot'];
var removeTimer = [],
top = [1, 10, 50];

function getChan(channel = '') {
	return channel.replace(/^#/, '');
};
const twitchBadgeCache = {
    data: { global: {} }
};
const bttvEmoteCache = {
    lastUpdated: 0,
    data: { global: [] },
    urlTemplate: '//cdn.betterttv.net/emote/{{id}}/{{image}}'
};

const krakenBase = 'https://api.twitch.tv/kraken/';
const krakenClientID = '4g5an0yjebpf93392k4c5zll7d7xcec';

const chatFilters = [
    // '\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF', // Partial Latin-1 Supplement
    // '\u0100-\u017F', // Latin Extended-A
    // '\u0180-\u024F', // Latin Extended-B
    '\u0250-\u02AF', // IPA Extensions
    '\u02B0-\u02FF', // Spacing Modifier Letters
    '\u0300-\u036F', // Combining Diacritical Marks
    '\u0370-\u03FF', // Greek and Coptic
    '\u0400-\u04FF', // Cyrillic
    '\u0500-\u052F', // Cyrillic Supplement
    '\u0530-\u1FFF', // Bunch of non-English
    '\u2100-\u214F', // Letter Like
    '\u2500-\u257F', // Box Drawing
    '\u2580-\u259F', // Block Elements
    '\u25A0-\u25FF', // Geometric Shapes
    '\u2600-\u26FF', // Miscellaneous Symbols
    // '\u2700-\u27BF', // Dingbats
    '\u2800-\u28FF', // Braille
    // '\u2C60-\u2C7F', // Latin Extended-C
];
const chatFilter = new RegExp(`[${chatFilters.join('')}]`);

function request({ base = '', endpoint = '', qs, headers = {}, method = 'get' }) {

    function formQuerystring(qs = {}) {
        return Object.keys(qs)
            .map(key => `${key}=${qs[key]}`)
            .join('&');
    }

	let opts = {
			method,
			headers: new Headers(headers)
		};
	return fetch(base + endpoint + '?' + formQuerystring(qs), opts)
	.then(res => res.json());
};

function getBadges(channel) {
	return kraken({
		base: 'https://badges.twitch.tv/v1/badges/',
		endpoint: (channel ? `channels/${channel}` : 'global') + '/display',
		qs: { language: 'en' }
	})
	.then(data => data.badge_sets);
}

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

function twitchNameToUser(username) {
	return kraken({
		endpoint: 'users',
		qs: { login: username }
	})
	.then(({ users }) => users[0] || null);
};

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
};

function applyRank(msgUser, forLenTable){

}

function newConnection(socket){
    console.log('New connection: ' + socket.id);
    const client = new tmi.client(opts);
    client.on('chat', onMessageHandler);
    client.on('action', onMessageHandler);
    client.on('connected', onConnectedHandler);
    client.on('disconnected', onDisconnectedHandler);
    client.on('join', (channel, username, self) => {
		if(!self) {
			return;
        }
        console.log('JOINED!');
		let chan = getChan(channel);
		getBTTVEmotes(chan);
		twitchNameToUser(chan)
			.then(user => getBadges(user._id))
            .then(badges => twitchBadgeCache.data[chan] = badges);
	});
    client.on('whisper', onWhisperHandler);
    client.connect();

    //Chat system
    function removeA(arr) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while ((ax= arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    };
    function ordinal_suffix_of(i) {
        var j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    };
    function htmlEntities(html) {
        function it() {
            return html.map(function(n, i, arr) {
                    if(n.length == 1) {
                        return n.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                            return '&#'+i.charCodeAt(0)+';';
                        });
                    }
                    return n;
                });
        }
        var isArray = Array.isArray(html);
        if(!isArray) {
            html = html.split('');
        }
        html = it(html);
        if(!isArray) html = html.join('');
        return html;
    };
    function formatEmotes(channel, text, emotes) {
        let bttvEmotes = bttvEmoteCache.data.global.slice(0);
        let chan = getChan(channel);
        if(chan in bttvEmoteCache.data) {
            bttvEmotes = bttvEmotes.concat(bttvEmoteCache.data[chan]);
        }
        var splitText = text.split('');
        bttvEmotes.forEach(({ code, id, type, imageType }) => {
			let hasEmote = text.indexOf(code);
            if(hasEmote === -1) { return;
            } else { 
                for (let start = text.indexOf(code); start > -1; start = text.indexOf(code, start + 1)) {
                    let end = start + code.length;
                    let url = bttvEmoteCache.urlTemplate;
                    url = url.replace('{{id}}', id).replace('{{image}}', '1x');
                    var mote = [parseInt(start), parseInt(end)];
                    var length =  mote[1] - mote[0],
                        empty = Array.apply(null, new Array(length + 1)).map(function() { return '' });
                    splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                    splitText.splice(mote[0], 1, '<img class="emoticon" src="' + url + '">');
                    console.log(splitText);
                };
            };
        })
        for(var i in emotes) {
            var e = emotes[i];
            for(var j in e) {
                var mote = e[j];
                if(typeof mote == 'string') {
                    mote = mote.split('-');
                    mote = [parseInt(mote[0]), parseInt(mote[1])];
                    var length =  mote[1] - mote[0],
                        empty = Array.apply(null, new Array(length + 1)).map(function() { return '' });
                    splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                    splitText.splice(mote[0], 1, '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">');
                }
            }
        }
        return htmlEntities(splitText).join('')
    };
    function formatBadges(channel, user){
        let chan = getChan(channel);
        if('badges' in user && user.badges !== null) {
            let badgeGroup = Object.assign({}, twitchBadgeCache.data.global, twitchBadgeCache.data[chan] || {});
            let ele = [];
			let badges = Object.keys(user.badges)
				.forEach(type => {
					let version = user.badges[type];
					let group = badgeGroup[type];
					if(group && version in group.versions) {
						let url = group.versions[version].image_url_1x;
                        var badgeAry = [url,type];
                        ele.push(badgeAry);
					}
                },
            []);
            return ele;
		}
    }
    //POINTS SYSTEM
    function inputUser(user, channel){
        knex('users').insert([{user_name: user.username, points: 0}]).then((rows) => {
            console.log('NEW USER ADDED!  -- ' + user.username);
            client.say (channel, `${user.username} added!`);
        }).catch((err) =>{
            console.log('User already added: '+ user.username);
        });
    };
    function checkRank(splitMsg, user, channel){
        let displayName = user['display-name'];
        msgUser = user.username;
        if (splitMsg[1] != null && splitMsg[1] !== 'me'){
            let displayName = splitMsg[1].replace('@', '');
            msgUser = splitMsg[1].replace('@', '').toLowerCase();
        };
        knex.from('users').where('user_name', msgUser).then((userDataTable) => {
            let userData = userDataTable[0];
            knex.from('users').where('points', '>', userData.points).then((forLenTable) => {
                client.say (channel, `${msgUser}'s current rank is ${ordinal_suffix_of(forLenTable.length+1)} with ${userData.points} points`);
                let usrRank = forLenTable.length;
                for (let i=0; i < top.length; i++) {
                    if (usrRank < top[i]) {
                        usrRank = i;
                        knex.from('users').select("user_name", "rank").where('user_name', msgUser).update("rank", i )
                        .then(() => {
                            console.log('Ran add interger: ' + i);
                        }).catch((err) => { console.log(err); throw err });
                        break;
                    };
                };
            });
        });
    };
    function addPoints(splitMsg, user, channel){
        let msgUser = splitMsg[0].replace('@','').toLowerCase();
        if (msgUser){
            knex.from('users').select("user_name", "points").where('user_name', msgUser)
            .then((returnData) => {
                if (returnData.length != 0){
                    var newData = JSON.parse(JSON.stringify(returnData[0]));
                    var points = parseInt(newData.points) + 1;
                    let oldRow, newRow;
                    if (msgUser !== user.username){
                        knex.from('users').select('*').orderBy('points', 'desc').then((table) => {
                            for (let index = 0; index < table.length; index++) {
                                if (table[index].user_name == msgUser){
                                    oldRow = index+1;
                                }
                            }
                        }).catch((err) => { console.log( err); throw err });
                        console.log('New points are: ' + points);
                        knex.from('users').select("user_name", "points").where('user_name', msgUser).update({ points: points })
                        .then(() => {}).catch((err) => { console.log(err); throw err });
                        knex.from('users').select('*').orderBy('points', 'desc').then((table) => {
                            for (let j = 0; j < table.length; j++) {
                                if (table[j].user_name == msgUser){
                                    newRow = j+1;
                                    if (newRow < oldRow){
                                        client.say(channel, 'Rank has increased! ' + msgUser + ' is now rank ' + newRow);
                                    }
                                }
                            }
                            if(user.username !== 'colloquialowl')cooldown.push(user.username);
                            setTimeout(function(){
                                removeA(cooldown, user.username);
                            }, 60000);
                        }).catch((err) => { console.log( err); throw err });
                    } else {
                        console.log("Can't give points to yourself");
                    }
                }
            }).catch((err) => { console.log( err); throw err });
        }
    };
    function dataInput(message, user, channel){
        let splitMsg = message.slice(1).split(" ").filter((el) => el.length > 0);
        let msgUser;
        if (splitMsg[0] == 'me'){
            inputUser(user, channel);
        } else if (splitMsg[0] == 'rank'){
            checkRank(splitMsg, user, channel)
        } else if (cooldown.includes(user.username) == false && splitMsg[0] != null){
            addPoints(splitMsg, user, channel);
        } else {
            console.log('User is on cooldown');
        };
    };
    function dataRemove(user){   
        knex.from('users').where('user_name', user.username).del().then(() => {
            console.log('Removed ', user.username, ' from the database')
        }).catch((err) =>{
            console.log('Error deleting user: '+ user.username);
            console.log(err);
        });
    };
    //Client functions
    function onConnectedHandler (addr, port) {
        console.log(`* Connected to ${addr}:${port}`);
        getBTTVEmotes();
		getBadges()
			.then(badges => twitchBadgeCache.data.global = badges);
    };
    function onDisconnectedHandler (){
        twitchBadgeCache.data = { global: {} };
		bttvEmoteCache.data = { global: [] };
    };
    function onMessageHandler (channel, user, message, self) {
        if (self || chatFilter.test(message) ) { return; }

        let style = [];
        let userBracket = 3;
        var formattedMsg = formatEmotes(channel, message, user.emotes);
        var fmtBadges = formatBadges(channel, user);
    
        if (message.startsWith("+")){
            dataInput(message, user, channel);
            style.push('function');
        }
    
        if (message == '-me'){
            removeTimer.push(user.username);
            cooldown.push(user.username);
            client.say (channel, `${user['display-name']} to delete your ranking whisper to this bot "-me please"`);
            setTimeout(function(){
                removeA(removeTimer, user.username);
                removeA(cooldown, user.username);
            }, 60000);
        }
        
        knex.from('users').where('user_name', user.username).select("rank").then((rankNum) => {
            if (rankNum[0]){
                userBracket = rankNum[0].rank
            }
            // Function that grabs their rank bracket if they haven't got one yet
            socket.emit('newMsg', formattedMsg, user['display-name'], style, userBracket, fmtBadges);
            console.log(user['display-name'] + ': ' + message);
        }).catch((err) =>{
            console.log(err);
        });


    }
    function onWhisperHandler (channel, user, message, self){
        if (self || chatFilter.test(message) ) { return; }
        if (message == '-me please'){
            dataRemove(user);
        }
    }
}

function getBTTVEmotes(channel) {
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
	});
}

/* knex.schema.table('users', table => {
    table.dropColumn('Rank Grouping');
}).then(() => {
    console.log('What');
}).catch((err) =>{
    console.log(err);
}); */