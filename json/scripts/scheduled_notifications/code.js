/*
 * Scheduled Task: scheduled_notifications
 */

var Corus = require('corus');
var notification = require('/custom_modules/notification');

/**
 * Response
 *
 * - next:  Method to invoke when the scheduled task has finished
 */

/**
 * Execution Environment:
 *
 *  - process.env.HOST:     The host where this script is running.
 *  - process.env.APP:      The slug of the app that contains this trigger.
 *  - process.env.KEY:      The key to impersonate a "developer" user on this app.
 */

/**
 *  Corus Client
 */

var corus = new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true});

/**
 * Code
 */

var now = new Date();

var filter = {

    count: false,
    where: {

        published: true,
        is_sent: {$ne: true},
        datum: {$lte: now}

    }

};

corus.apps(process.env.APP).collections('notifications').data().get(filter, function(err, notifications){

    if(err){

        next(err);

    } else {

        var array = notifications.array || [];

        (function step(index){

            if(index >= array.length){

                console.log('Se han procesado ' + array.length + ' notificaciones');
                next(null);

            } else {

                notification.process(corus, array[index], function(err, notificationJson){

                    if(err){

                        console.error('Error procesando notificación: ' + JSON.stringify(err));
                        step(index+1);

                    } else {

                        notificationJson = {

                            is_sent: notificationJson.is_sent,
                            result_datum: notificationJson.result_datum,
                            result: notificationJson.result

                        };

                        corus.apps(process.env.APP).collections('notifications').data(array[index].id).put(notificationJson, function(err, result){

                            if(err){

                                console.error('Error actualizando notificación: ' + JSON.stringify(err));
                                step(index+1);

                            } else {

                                step(index+1);

                            }

                        });

                    }

                });

            }

        })(0);

    }

});
