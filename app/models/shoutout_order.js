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
            type: DataTypes.STRING
        },
        caption: {
            type: DataTypes.TEXT
        },
        media_link: {
            type: DataTypes.TEXT
        },
        publish_time: {
            type: DataTypes.DATE
        },
        price: {
            type: DataTypes.DECIMAL(10, 2)
        },
        price_option: {
            type: DataTypes.TEXT
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