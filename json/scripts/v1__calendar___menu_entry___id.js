/*
 * REST Resource: v1/calendar/:menu_entry/:id
 */

var Corus 				= require('corus'),
    async				= require('async'),
    moment				= require('moment'),
    lang 				= null,
    corus 				= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: lang, fillWithDefaultLang: true}),
    jsonBody;



if (req.method === 'GET') {

    next(null, {});

} else if(req.method === 'POST') {

    jsonBody = JSON.parse(req.body);

    async.waterfall(
        [
            function(icallback) {

                var filter = {
                    where: 		{
                        device:		req.headers.device,
                        parent:		req.params.id
                    },
                    count:		false
                };

                // Check if the user has already rated this content
                corus.apps(process.env.APP).collections('calendar_entries_rating').data().get(filter, function(err, result){
                    if (!err && result.array.length > 0){
                        icallback('Already rated.');
                    } else {
                        icallback(err);
                    }
                });

            },
            function(icallback) {

                var entry = {
                    device:		req.headers.device,
                    parent:		req.params.id,
                    rating:		jsonBody.rating
                };

                // We save the content rating
                corus.apps(process.env.APP).collections('calendar_entries_rating').data().post(entry, function(err, item){
                    icallback(err);
                });

            },
            function(icallback) {

                // Update the rating results
                require('/custom_modules/calendar').updateEntryRating(corus, req.params.id, function(err){
                    icallback(err);
                });

            }
        ],
        function(error){
            next(error);
        }
    );

} else {

    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});

}