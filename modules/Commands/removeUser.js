const { knex } = require('../KnexOpts.js');

function removeUser(user){   
    knex.from('users').where('user_name', user.username).del().then(() => {
        console.log('Removed ', user.username, ' from the database')
    }).catch((err) =>{
        console.log('Error deleting user: '+ user.username);
        console.log(err);
    });
};

module.exports = {
    removeUser
};