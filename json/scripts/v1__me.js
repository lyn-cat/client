/*
 * REST Resource: v1/me
 *
 * URL for this resource: http://lyncat.corus.io/custom/dev_lyncat/v1/me
 *
 */

var Corus 		= require('corus'),
    async		= require('async'),
    moment		= require('moment'),
    lang 		= null,
    corus 		= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: null, fillWithDefaultLang: true}),
    jsonBody;



if (req.method === 'GET') {

    async.waterfall(
        [
            function(icallback){

                // Get user profile
                corus.users(req.user.email).get(function(err, user){

                    if (!err && user){
                        user.avatar = 'https://' + process.env.HOST + '/api/v1/users/' + req.user.email + '/avatar';
                    }

                    icallback(err, user);

                });

            }
        ],
        function(error, user){
            next(error, user);
        }
    );

} else {

    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});

}