/*
 * Module: menu
 *
 * Example of custom_module require:
 *
 * var menu = require('/custom_modules/menu');
 *
 */

/**
 * Private
 */

/**
 * Public Methods
 */

exports.setAppFilter = function(corus, app, filter, callback){

    if(!app){

        return callback(null);

    } else {

        if(!filter.where){

            filter.where = {};

        }

        corus.apps(process.env.APP).collections('app_menu').data().get({where: {app: app}, limit: 1000, count: false}, function(err, result){

            if(err){

                return callback(err);

            } else {

                filter.where.menu_entry = {$in: result.array.map(function(item){

                    return item.id;

                })};

                callback(err);

            }

        });

    }

};