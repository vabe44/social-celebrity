/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('TwitterAccount', {
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
        description: {
            type: DataTypes.TEXT,
            allowNull: true
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
                    models.TwitterAccount.belongsTo(models.User);
                    models.TwitterAccount.belongsTo(models.InfluencerType);
                    models.TwitterAccount.belongsTo(models.ShoutoutCategory);
                    models.TwitterAccount.belongsTo(models.Language);
                    models.TwitterAccount.belongsTo(models.Country);
                    models.TwitterAccount.belongsTo(models.Ages);
                    models.TwitterAccount.belongsTo(models.Sex);
                    models.TwitterAccount.belongsTo(models.Activity);
                }
            }
    });
};