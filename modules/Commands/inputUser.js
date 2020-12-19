const { knex } = require('../KnexOpts.js');

function inputUser(client, user, channel, userSettings, customSettings) {
  let low = customSettings.top.length + 1;
  knex('users')
    .select('user_name')
    .where('user_name', user.username)
    .then((rows) => {
      if (rows.length === 0) {
        knex('users')
          .insert([{ user_name: user.username, points: 0, rank: low }])
          .then(() => {
            console.log('NEW USER ADDED!  -- ' + user.username);
            client.say(channel, `${user.username} added!`);
            customSettings.runtime = false;
          })
          .catch((err) => {
            console.log(err);
            customSettings.runtime = false;
          });
      } else {
        console.log('User already added: ' + user.username);
        customSettings.runtime = false;
      }
    })
    .catch((err) => {
      console.log(err);
      customSettings.runtime = false;
    });
}

module.exports = {
  inputUser,
};
