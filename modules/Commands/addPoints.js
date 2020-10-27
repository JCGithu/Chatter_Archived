const { knex } = require('../KnexOpts.js');
const textParse = require('../Message Formatting/textParse.js');

function addPoints(client, splitMsg, user, channel){
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
                            textParse.cleave(cooldown, user.username);
                        }, 60000);
                    }).catch((err) => { console.log( err); throw err });
                } else {
                    console.log("Can't give points to yourself");
                }
            }
        }).catch((err) => { console.log( err); throw err });
    }
};

module.exports = {
    addPoints
};