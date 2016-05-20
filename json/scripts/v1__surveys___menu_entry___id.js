/*
 * REST Resource: v1/surveys/:menu_entry/:id
 *
 * URL for this resource: http://lyncat.corus.io/custom/dev_lyncat/v1/surveys/:menu_entry/:id
 *
 */

var Corus 				= require('corus'),
    async				= require('async'),
    moment				= require('moment'),
    lang 				= null,
    corus 				= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: lang, fillWithDefaultLang: true}),
    jsonBody;



if (req.method === 'GET') {

    next(null, {});

} else if (req.method === 'POST') {

    jsonBody = JSON.parse(req.body);

    if (jsonBody.questions){

        async.waterfall(
            [
                function(icallback) {

                    // We save each question result
                    var questions = jsonBody.questions.slice();

                    async.whilst(
                        function () { return questions.length > 0; },
                        function (jcallback) {

                            var q 		= questions.shift(),
                                entry 	= {
                                    device:		req.headers.device,
                                    survey:     req.params.id,
                                    question:   q.id,
                                    rating:     q.rating,
                                };

                            corus.apps(process.env.APP).collections('surveys_results').data().post(entry, function(err, item){
                                jcallback(err);
                            });

                        },
                        function (err) {
                            icallback(err);
                        }
                    );

                },
                function(icallback) {

                    // Update the survey results
                    require('/custom_modules/surveys').updateSurveyResults(corus, req.params.id, function(err){
                        icallback(err);
                    });

                }
            ],
            function(error){
                next(error);
            }
        );

    } else {
        next('Missing questions results.');
    }

} else {

    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});

}