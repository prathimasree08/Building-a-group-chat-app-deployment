const Sequelize = require('sequelize')
const sequelize = require('../util/database')

const Chats = sequelize.define('userchats', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    message:{
       type: Sequelize.STRING,
       allowNull: false
    } ,
})

module.exports = Chats