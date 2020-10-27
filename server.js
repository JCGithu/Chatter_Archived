const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

//Custom Modules
const { knex } = require('./modules/KnexOpts.js');
const { formatEmotes, getChan } = require('./modules/Message Formatting/formatEmotes.js');
const { formatBadges } = require('./modules/Message Formatting/formatBadges.js');
const textParse = require('./modules/Message Formatting/textParse.js');

const { request } = require ('./modules/Kraken/Fetch.js');
const { getBadges , twitchNameToUser } = require ('./modules/Kraken/Kraken.js');

//COMMANDS
const { checkRank } = require('./modules/Commands/checkRank.js');
const { inputUser } = require('./modules/Commands/inputUser.js');
const { addPoints } = require('./modules/Commands/addPoints.js');
const { removeUser } = require('./modules/Commands/removeUser.js');

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
    top = [1, 5, 10];


const twitchBadgeCache = {
    data: { global: {} }
};
const bttvEmoteCache = {
    lastUpdated: 0,
    data: { global: [] },
    urlTemplate: '//cdn.betterttv.net/emote/{{id}}/{{image}}'
};

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

    //POINTS SYSTEM
    function dataInput(message, user, channel){
        let splitMsg = message.slice(1).split(" ").filter((el) => el.length > 0);
        let msgUser;
        if (splitMsg[0] == 'me'){
            inputUser(client, user, channel);
        } else if (splitMsg[0] == 'rank'){
            checkRank(client, splitMsg, user, channel, top);
        } else if (cooldown.includes(user.username) == false && splitMsg[0] != null){
            addPoints(client, splitMsg, user, channel);
        } else {
            console.log('User is on cooldown');
        };
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
        var formattedMsg = formatEmotes(channel, message, user.emotes, bttvEmoteCache);
        var fmtBadges = formatBadges(channel, user, twitchBadgeCache);
    
        if (message.startsWith("+")){
            dataInput(message, user, channel);
            style.push('function');
        }
    
        if (message == '-me'){
            removeTimer.push(user.username);
            client.say (channel, `${user['display-name']} to delete your ranking whisper to this bot "-me please"`);
            setTimeout(function(){
                textParse.cleave(removeTimer, user.username);
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
    };
    function onWhisperHandler (channel, user, message, self){
        if (self || chatFilter.test(message) ) { return; }
        if (message == '-me please'){
            removeUser(user);
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