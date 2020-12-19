const { knex } = require('../KnexOpts.js');
const textParse = require('../Message Formatting/textParse.js');

function checkRank(client, splitMsg, user, channel, userSettings, customSettings) {
  msgUser = user.username;
  if (splitMsg[1] != null && splitMsg[1] !== 'me') {
    msgUser = splitMsg[1].replace('@', '').toLowerCase();
  }
  knex
    .from('users')
    .where('user_name', msgUser)
    .then((userDataTable) => {
      let userData = userDataTable[0];
      if (userData.points) {
        knex
          .from('users')
          .where('points', '>', userData.points)
          .then((forLenTable) => {
            client.say(
              channel,
              `${msgUser}'s current rank is ${textParse.suffix(forLenTable.length + 1)} with ${userData.points} points`
            );
            let usrRank = forLenTable.length;
            for (let i = 0; i < customSettings.top.length; i++) {
              if (usrRank < customSettings.top[i]) {
                usrRank = i;
                knex
                  .from('users')
                  .select('user_name', 'rank')
                  .where('user_name', msgUser)
                  .update({ rank: i })
                  .then(() => {
                    console.log('Changed user rank bracket to: ' + i);
                    customSettings.runtime = false;
                  })
                  .catch((err) => {
                    console.log(err);
                    customSettings.runtime = false;
                    throw err;
                  });
                break;
              } else {
                customSettings.runtime = false;
              }
            }
          });
      } else {
        console.log('User not found in database');
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = {
  checkRank,
};
