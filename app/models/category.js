/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Category', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
            tableName: 'shoutout_categories',
            underscored: true
        });
};