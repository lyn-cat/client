/*
 * Module: auth
 *
 * Example of custom_module require:
 *
 * var auth = require('/custom_modules/auth');
 *
 * Versión: 1.0 => First Commit
 *
 */

var async = require('async');

exports.getUserTags = function(corus, email, callback){

    if (corus && email){

        async.waterfall(
            [
                function(icallback) {

                    // Get user tags
                    corus.users(email).get(function(err, user){

                        var tags = [];

                        if (!err && user && user.apps && user.apps[process.env.APP] && user.apps[process.env.APP].tags){
                            tags = user.apps[process.env.APP].tags || [];

                        }

                        icallback(err, tags);

                    });

                }
            ],
            function(error, response){

                if (callback && typeof(callback) === 'function'){
                    callback(error, response);
                }

            }

        );

    } else if (callback && typeof(callback) === 'function'){
        callback(null, null);
    }

};