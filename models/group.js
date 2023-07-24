const Sequelize = require('sequelize')
const sequelize = require('../util/database')

const Groups = sequelize.define('group', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name:{
       type: Sequelize.STRING,
       allowNull: false
    },
    admin:{
        type:Sequelize.STRING
    }
})

module.exports = Groups