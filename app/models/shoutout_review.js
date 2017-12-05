/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('ShoutoutReview', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5,
            validate: { min: 1, max: 5 }
        },
    }, {
            tableName: 'shoutout_reviews',
            underscored: true,
            classMethods: {
                associate: function (models) {
                    models.ShoutoutReview.belongsTo(models.User);
                    models.ShoutoutReview.belongsTo(models.Shoutout);
                    models.ShoutoutReview.belongsTo(models.ShoutoutOrder);
                }
            }
        });
};