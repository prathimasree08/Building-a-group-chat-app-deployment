const Sequelize = require('sequelize');


const sequelize = new Sequelize('groupchatapp' , 'root' , 'root' , {
    dialect: 'mysql',
    host: 'localhost'
})

module.exports = sequelize;