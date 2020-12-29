const { knex } = require('./KnexOpts.js');

function topRank(customSettings, socket, callback) {
  return new Promise((resolve, reject) => {
    knex
      .from('users')
      .select('*')
      .orderBy('points', 'desc')
      .then((table) => {
        let lineArray = [];
        let top = customSettings.top;
        let topValue = top[top.length - 1];
        for (let j = 0; j < topValue; j++) {
          let line = [{ position: j + 1, name: table[j].user_name, points: table[j].points }];
          lineArray.push(line);
          if (j == topValue - 1) {
            customSettings.runtime = false;
            resolve(lineArray);
          }
        }
      });
  });
}

module.exports = {
  topRank,
};
