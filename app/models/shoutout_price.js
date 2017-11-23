/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('ShoutoutPrice', {
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
    }, {
        tableName: 'shoutout_price',
        underscored: true,
        classMethods: {
            associate: function (models) {
                models.Shoutout.belongsToMany(models.ShoutoutPriceOption, {through: 'ShoutoutPrice'});
                models.ShoutoutPriceOption.belongsToMany(models.Shoutout, {through: 'ShoutoutPrice'});
            }
        }
    });
};