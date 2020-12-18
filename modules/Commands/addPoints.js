const { response } = require('express');
const { knex } = require('../KnexOpts.js');
const textParse = require('../Message Formatting/textParse.js');
const { request } = require('../Kraken/Fetch.js');
const { getChan } = require('../Message Formatting/formatEmotes.js');

async function rankColumnCheck(msgUser, top) {
  knex
    .from('users')
    .where('user_name', msgUser)
    .then((userDataTable) => {
      let userData = userDataTable[0];
      knex
        .from('users')
        .where('points', '>', userData.points)
        .then((forLenTable) => {
          let usrRank = forLenTable.length;
          for (let i = 0; i < top.length; i++) {
            if (usrRank < top[i]) {
              usrRank = i;
              knex
                .from('users')
                .select('user_name', 'rank')
                .where('user_name', msgUser)
                .update({ rank: i })
                .then(() => {
                  console.log('Changed user rank bracket to: ' + i);
                  return;
                })
                .catch((err) => {
                  console.log(err);
                  throw err;
                });
              break;
            }
          }
        });
    });
}

function chatCheck(msgUser, channel, user, checkInChat, onlyMods) {
  return new Promise((res) => {
    function checkChat() {
      let chan = getChan(channel);
      let api = `http://tmi.twitch.tv/group/user/${chan}/chatters`;
      return new Promise((resolve) => {
        const response = request({ base: api });
        resolve(response);
      });
    }
    if (checkInChat) {
      checkChat().then((data) => {
        if (data) {
          var users = [],
            mods = [];
          if (onlyMods) {
            for (const [key, value] of Object.entries(data.chatters)) {
              if (Array.isArray(value) && key !== 'viewers') {
                users = users.concat(value);
              }
            }
          } else {
            Object.values(data.chatters).forEach((e) => {
              if (Array.isArray(e)) {
                users = users.concat(e);
              }
            });
          }
          if (msgUser == 'all') {
            for (const [key, value] of Object.entries(data.chatters)) {
              if (Array.isArray(value) && key !== 'viewers') {
                mods = mods.concat(value);
                if (mods.includes(user.username)) {
                  res(users);
                }
              }
            }
          } else if (users.includes(msgUser)) {
            res(users);
          } else {
            console.log('Points given to user not in chat');
            res(false);
          }
        }
      });
    } else {
      res(true);
    }
  });
}

function addPoints(client, splitMsg, user, channel, infoArrays, customSettings) {
  let msgUser = splitMsg[0].replace('@', '').toLowerCase();
  if (msgUser) {
    let check = chatCheck(msgUser, channel, user, customSettings.checkInChat, customSettings.onlyMods);
    check.then((usersInChat) => {
      if (usersInChat) {
        if (msgUser == 'all') {
          for (chatUser of usersInChat) {
            knex
              .from('users')
              .select('user_name', 'points')
              .where('user_name', chatUser)
              .then((returnData) => {
                if (returnData.length !== 0) {
                  console.log(returnData[0].user_name);
                  readAndWritePoints(returnData, returnData[0].user_name, user, channel, infoArrays, client);
                }
              });
          }
        } else {
          knex
            .from('users')
            .select('user_name', 'points')
            .where('user_name', msgUser)
            .then((returnData) => {
              readAndWritePoints(returnData, msgUser, user, channel, infoArrays, client);
            })
            .catch((err) => {
              console.log(err);
              throw err;
            });
        }
      }
    });
  }
}

async function readAndWritePoints(returnData, msgUser, user, channel, infoArrays, client) {
  if (returnData.length != 0) {
    var newData = JSON.parse(JSON.stringify(returnData[0]));
    var points = parseInt(newData.points) + 1;
    let oldRow, newRow;
    if (msgUser !== user.username) {
      if (infoArrays.double.includes(msgUser)) {
        var points = parseInt(newData.points) + 2;
      }
      knex
        .from('users')
        .select('*')
        .orderBy('points', 'desc')
        .then((table) => {
          for (let index = 0; index < table.length; index++) {
            if (table[index].user_name == msgUser) {
              oldRow = index + 1;
            }
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
      console.log('New points are: ' + points);
      knex
        .from('users')
        .select('user_name', 'points')
        .where('user_name', msgUser)
        .update({ points: points })
        .then(() => {
          knex
            .from('users')
            .select('*')
            .orderBy('points', 'desc')
            .then((table) => {
              for (let j = 0; j < table.length; j++) {
                if (table[j].user_name == msgUser) {
                  newRow = j + 1;
                  if (newRow < oldRow) {
                    client.say(channel, 'Rank has increased! ' + msgUser + ' is now rank ' + newRow);
                    rankColumnCheck(msgUser, infoArrays.top).then(() => {
                      return;
                    });
                  }
                }
              }
            })
            .catch((err) => {
              console.log(err);
              throw err;
            });
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    } else {
      console.log("Can't give points to yourself");
    }
  }
}

module.exports = {
  addPoints,
};
