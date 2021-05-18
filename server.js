const util = require('util');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();
const { knex } = require('./modules/KnexOpts.js');

//Message Parsing Modules
const { formatEmotes, getChan } = require('./modules/Message Formatting/formatEmotes.js');
const { formatBadges } = require('./modules/Message Formatting/formatBadges.js');

//Kraken Modules
const { getBadges, twitchNameToUser } = require('./modules/Kraken/Kraken.js');
const { getBTTVEmotes, twitchBadgeCache, bttvEmoteCache } = require('./modules/Kraken/getBTTVEmotes.js');

//Command Modules
const { checkRank } = require('./modules/Commands/checkRank.js');
const { inputUser } = require('./modules/Commands/inputUser.js');
const { addPoints } = require('./modules/Commands/addPoints.js');
const { removeUser } = require('./modules/Commands/removeUser.js');
const { topRank } = require('./modules/topRank.js');
const textParse = require('./modules/Message Formatting/textParse.js');

//EXPRESS
const express = require('express');
const app = express();
const server = app.listen(3000, () => {
  console.log('Server listening...');
});
app.use(express.static('public'));

//SOCKET.IO
var socket = require('socket.io');
var io = socket(server);
io.sockets.on('connection', newConnection);
io.sockets.on('disconnect', function () {
  io.sockets.disconnect();
});

var useColor = true,
  showBadges = true,
  showEmotes = true,
  doTimeouts = true;

const customSettings = { checkInChat: false, onlyMods: false, runtime: false, top: [1, 5, 10], rankPost: 5 };
const chatProperties = { cooldown: ['nightbot', 'colloquialbot'], removeTimer: [], double: [] };
const messageSettings = { display: true };

const tmi = require('tmi.js');
const opts = {
  identity: {
    username: 'colloquialbot',
    password: process.env.OAUTH4,
  },
  channels: ['colloquialowl'],
};

let runtime = false;

function newConnection(socket) {
  console.log('New connection: ' + socket.id);
  const client = new tmi.client(opts);

  client.on('chat', onMessageHandler);
  client.on('action', onMessageHandler);

  //POINTS SYSTEM
  function dataInput(message, user, channel) {
    runtime = true;
    messageSettings.display = false;
    let splitMsg = message
      .slice(1)
      .split(' ')
      .filter((el) => el.length > 0);

    if (splitMsg[0] == 'me') inputUser(client, user, channel, chatProperties, customSettings);

    if (splitMsg[0] == 'rank') checkRank(client, splitMsg, user, channel, chatProperties, customSettings);

    if (user.username == channel.slice(1) && splitMsg[0] == 'leaderboard') topRankinChat();

    if (chatProperties.cooldown.includes(user.username)) console.log('User on cooldown');

    if (chatProperties.cooldown.includes(user.username) == false && splitMsg[0] != null) {
      addPoints(client, splitMsg, user, channel, chatProperties, customSettings);
      if (user.username !== channel.slice(1)) chatProperties.cooldown.push(user.username);
      setTimeout(function () {
        textParse.cleave(chatProperties.cooldown, user.username);
      }, 60000);
    }

    return;
  }
  function onMessageHandler(channel, user, message, self) {
    if (self || textParse.chatFilter.test(message)) return;

    let style = [];
    let userBracket = top.length + 1;
    var formattedMsg = formatEmotes(channel, message, user.emotes, bttvEmoteCache);
    var fmtBadges = formatBadges(channel, user, twitchBadgeCache);

    if (message.startsWith('+')) {
      function runtimeLoop(message, user, channel) {
        if (runtime === false) {
          dataInput(message, user, channel);
          style.push('function');
          return;
        }
        setTimeout(function () {
          runtimeLoop(message, user, channel);
        }, 500);
      }
      runtimeLoop(message, user, channel);
    }

    if (message === '-me') {
      chatProperties.removeTimer.push(user.username);
      client.say(channel, `${user['display-name']} to delete your ranking whisper to this bot "-me please"`);
      setTimeout(function () {
        textParse.cleave(chatProperties.removeTimer, user.username);
      }, 60000);
    }

    if (user['custom-reward-id'] === '4a728898-4e19-4ed9-be1e-f76df1d8c1a5') chatProperties.double.push(user.username);

    knex('users')
      .select('user_name')
      .where('user_name', user.username)
      .then((rows) => {
        if (rows.length === 0) {
          socket.emit('newMsg', formattedMsg, user['display-name'], style, userBracket, fmtBadges);
          return;
        }
      })
      .select('rank')
      .then((rankNum) => {
        if (rankNum[0].rank != null) userBracket = rankNum[0].rank;
        if (messageSettings.display === true) {
          socket.emit('newMsg', formattedMsg, user['display-name'], style, userBracket, fmtBadges);
          return;
        }
        messageSettings.display = true;
        console.log(user['display-name'] + ': ' + message);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  setInterval(function () {
    topRankinChat();
  }, Math.floor(customSettings.rankPost * 60000));

  function topRankinChat() {
    topRank(customSettings, socket).then((data) => {
      if (data) socket.emit('rankings', data);
    });
  }

  client.on('connected', (addr, port) => {
    console.log(`* Connected to ${addr}:${port}`);
    getBTTVEmotes(bttvEmoteCache);
    getBadges().then((badges) => (twitchBadgeCache.data.global = badges));
  });

  client.on('join', (channel, username, self) => {
    if (!self) return;
    console.log('JOINED!');
    let chan = getChan(channel);
    getBTTVEmotes(bttvEmoteCache, chan);
    twitchNameToUser(chan)
      .then((user) => getBadges(user._id))
      .then((badges) => (twitchBadgeCache.data[chan] = badges));
  });

  client.on('whisper', (channel, user, message, self) => {
    if (self || textParse.chatFilter.test(message)) return;
    if (message === '-me please') removeUser(user);
  });

  client.on('timeout', (channel, username, reason, duration, userstate) => {
    socket.emit('timeout', username);
  });

  client.connect();
}
