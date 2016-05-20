/*
 * Module: notification
 *
 * Example of custom_module require:
 *
 * var notification = require('/custom_modules/notification');
 *
 * Versión: 1.0 => First Commit
 *
 */

/**
 * Const
 */

var MAX_PUSH_LENGTH = 100;

/**
 * Private
 */

var async = require('async');


/**
 * Public Methods
 */

exports.process = function(corus, notificationJson, callback){

    async.waterfall(

        [

            function(cb){

                if(!notificationJson.id){

                    return cb(null, null);

                } else {

                    corus.apps(process.env.APP).collections('notifications').data(notificationJson.id).get(function(err, result){

                        if(err && err.statusCode !== 404){

                            return cb(err);

                        } else {

                            return cb(null, result);

                        }

                    });

                }

            },

            function(notification, cb){

                var now = new Date();

                if(!notification){

                    return cb(null, notificationJson);

                } else if(notification.is_sent && notificationJson.published === false){

                    //Estamos despublicando una notificación enviada

                    notificationJson.is_sent = false;
                    notificationJson.result_datum = null;
                    notificationJson.result = null;

                    return cb(null, notificationJson);

                } else if(!notification.is_sent && notificationJson.published && (!notificationJson.datum || (new Date(notificationJson.datum)).getTime() < now.getTime())) {

                    //Estamos enviando la notificación ahora mismo

                    notificationJson.is_sent = true;
                    notificationJson.result_datum = now;
                    var body = notificationJson.body;

                    if(body && body.length > MAX_PUSH_LENGTH){

                        body = body.substring(0, 97) + '...';

                    }

                    var pushJson = {

                        body: body

                    };

                    if(notificationJson.filter_no_logged_users_only){

                        //Solo a los no logados

                        corus.apps(process.env.APP).installations().push(pushJson, {user: null}, function(err, pushResult){

                            if(!err && pushResult){

                                notificationJson.result = JSON.stringify(pushResult);

                            }

                            return cb(err, notificationJson);

                        });

                    } else if(notificationJson.tag_filters && notificationJson.tag_filters.length > 0){

                        //Solo a los que cumplen una serie de tags

                        var filter = {

                            where: {tags: {$in: notificationJson.tag_filters}},
                            limit: 99999,
                            projection: {email: 1},
                            count: false

                        };

                        corus.apps(process.env.APP).users().get(filter, function(err, users){

                            if(err){

                                return cb(err);

                            } else {

                                var emails = users.array.map(function(item){

                                    return item.email;

                                });

                                corus.apps(process.env.APP).installations().push(pushJson, {user: {$in: emails}}, function(err, pushResult){

                                    if(!err && pushResult){

                                        notificationJson.result = JSON.stringify(pushResult);

                                    }

                                    return cb(err, notificationJson);

                                });

                            }

                        });


                    } else {

                        //A todo el mundo

                        corus.apps(process.env.APP).installations().push(pushJson, {}, function(err, pushResult){

                            if(!err && pushResult){

                                notificationJson.result = JSON.stringify(pushResult);

                            }

                            return cb(err, notificationJson);

                        });

                    }

                } else {

                    return cb(null, notificationJson);

                }

            }

        ],

        function(err, notification){

            return callback(err, notification);

        }

    );

};