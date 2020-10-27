const { knex } = require('../KnexOpts.js');
const textParse = require('../Message Formatting/textParse.js');

function rankColumnCheck(msgUser, top){
    knex.from('users').where('user_name', msgUser).then((userDataTable) => {
        let userData = userDataTable[0];
        knex.from('users').where('points', '>', userData.points).then((forLenTable) => {
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
    });
}

function addPoints(client, splitMsg, user, channel, top){
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
                                    rankColumnCheck(msgUser, top);
                                }
                            }
                        }
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