const Sequelize = require('sequelize')
const sequelize = require('../util/database')

const UserGroups = sequelize.define('usergroups', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }
})

module.exports = UserGroups