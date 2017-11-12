"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var env = process.env.NODE_ENV || "development";
var config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db = {};

const CLASSMETHODS = 'classMethods';
const ASSOCIATE = 'associate';


fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function (file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if (CLASSMETHODS in db[modelName].options) {
        if (ASSOCIATE in db[modelName].options[CLASSMETHODS]) {
            db[modelName].options.classMethods.associate(db);
        }
    }
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;