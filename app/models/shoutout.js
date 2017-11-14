/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Shoutout', {
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
        tableName: 'shoutouts',
        underscored: true,
        classMethods: {
            associate: function (models) {
                models.Shoutout.belongsTo(models.User);
                models.Shoutout.belongsTo(models.TwitterAccount);
            }
        }
});
};