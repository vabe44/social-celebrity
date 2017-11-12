/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('TwitterAccounts', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        verification_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
            tableName: 'twitter_accounts',
            underscored: true,
            classMethods: {
                associate: function (models) {
                    models.TwitterAccounts.belongsTo(models.User);
                }
            }
    });
};