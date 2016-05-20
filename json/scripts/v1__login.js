/*
 * REST Resource: v1/login
 */

var Corus 				= require('corus'),
    async				= require('async'),
    lang 				= null,
    corus 				= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: lang, fillWithDefaultLang: true}),
    jsonBody;



if (req.method === 'POST') {

    jsonBody = JSON.parse(req.body);

    if (jsonBody && jsonBody.email && jsonBody.password){

        async.waterfall(
            [
                function(icallback){

                    // Login for returning the key
                    corus.login({
                        email: 		jsonBody.email,
                        password: 	require('/custom_modules/password').decode(jsonBody.password)
                    }, function(err, user){

                        if (!err && user){
                            user.avatar = 'https://' + process.env.HOST + '/api/v1/users/' + jsonBody.email + '/avatar';
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
        // Missing parameters error
        next({statusCode: 400, message: 'Invalid user parameters.'});
    }

} else {

    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});

}