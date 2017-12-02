/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('ShoutoutFavorite', {
        //
    }, {
        tableName: 'shoutout_favorites',
        underscored: true,
        classMethods: {
            associate: function (models) {
                models.User.belongsToMany(models.Shoutout, {through: 'ShoutoutFavorite'});
                models.Shoutout.belongsToMany(models.User, {through: 'ShoutoutFavorite'});
                models.ShoutoutFavorite.belongsTo(models.Shoutout);
                models.ShoutoutFavorite.belongsTo(models.User);
            }
        }
    });
};