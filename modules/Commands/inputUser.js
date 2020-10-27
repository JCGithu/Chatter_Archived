const { knex } = require('../KnexOpts.js');

function inputUser(client, user, channel){
    knex('users').where('user_name', user.username).then(() => {
        console.log('User already added: '+ user.username);
    }).catch((err) => {
        knex('users').insert([{user_name: user.username, points: 0}]).then((rows) => {
            console.log('NEW USER ADDED!  -- ' + user.username);
            client.say (channel, `${user.username} added!`);
        }).catch((err) =>{console.log(err)});
    });
};

module.exports = {
    inputUser
};