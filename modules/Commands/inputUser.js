const { knex } = require('../KnexOpts.js');

function inputUser(client, user, channel, top){
    let low = top.length + 1;
    knex('users').select('user_name').where('user_name', user.username).then((rows) => {
        if (rows.length===0) {
            knex('users').insert([{user_name: user.username, points: 0, rank : low}]).then((rows) => {
                console.log('NEW USER ADDED!  -- ' + user.username);
                client.say (channel, `${user.username} added!`);
            }).catch((err) =>{console.log(err)});
        } else { console.log('User already added: '+ user.username);}
    }).catch((err) => {console.log(err)});
};

module.exports = {
    inputUser
};