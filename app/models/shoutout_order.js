/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('ShoutoutOrder', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        stripe_tx_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        tableName: 'shoutout_orders',
        underscored: true,
        classMethods: {
            associate: function (models) {
                models.ShoutoutOrder.belongsTo(models.User);
                models.ShoutoutOrder.belongsTo(models.Shoutout);
            }
        }
    });
};