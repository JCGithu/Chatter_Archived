const { knex } = require('./KnexOpts.js');

topRank = (top, socket, callback) => {
    return new Promise((resolve, reject) => {
        knex.from('users').select('*').orderBy('points', 'desc').then((table) => {
            let lineArray = [];
            top = top[top.length - 1]
            for (let j = 0; j < top; j++) {
                let line = [{position: j+1, name: table[j].user_name, points: table[j].points}];
                lineArray.push(line);
                if (j == top - 1){
                    resolve(lineArray);
                }
            }
        });
    });
}

module.exports = {
    topRank
};