const { knex } = require('../KnexOpts.js');
const textParse = require('../Message Formatting/textParse.js');

function checkRank(client, splitMsg, user, channel, top, botPrint){
  msgUser = user.username;
  if (splitMsg[1] != null && splitMsg[1] !== 'me'){
      msgUser = splitMsg[1].replace('@', '').toLowerCase();
  };
  knex.from('users').where('user_name', msgUser).then((userDataTable) => {
    let userData = userDataTable[0];
    if (userData.points){
      knex.from('users').where('points', '>', userData.points).then((forLenTable) => {
        if (botPrint){
          client.say (channel, `${msgUser}'s current rank is ${textParse.suffix(forLenTable.length+1)} with ${userData.points} points`);
        }
        let usrRank = forLenTable.length;
        for (let i=0; i < top.length; i++) {
          if (usrRank < top[i]) {
            usrRank = i;
            knex.from('users').select("user_name", "rank").where('user_name', msgUser).update({ rank: i })
            .then(() => {
              console.log('Changed user rank bracket to: ' + i);
            }).catch((err) => { console.log(err); throw err });
            break;
          };
        };
      });
    } else {
      console.log('User not found in database');
    }
  }).catch((err) =>{
    console.log(err);
  });;
};

module.exports = {
    checkRank
};