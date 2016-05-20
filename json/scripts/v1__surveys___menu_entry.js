/*
 * REST Resource: v1/surveys/:menu_entry
 *
 * URL for this resource: http://lyncat.corus.io/custom/dev_lyncat/v1/surveys/:menu_entry
 *
 */

var Corus 				= require('corus'),
    async				= require('async'),
    moment				= require('moment'),
    lang 				= req.query.lang || req.headers.lang || req.cookies.lang || null,
    corus 				= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: lang, fillWithDefaultLang: true}),
    unique_ids			= [],
    filter				= {
        where: 		{
            menu_entry:	req.params.menu_entry,
            enabled: 	true,
            '$or':		[{ 'tag_filters':null }, { 'tag_filters':[] }]
        },
        order:		'-from',
        skip:		null,
        limit:		null,
        count:		false
    },
    children_filter		= {
        where: 		{
            parent: {
                $in: unique_ids
            }
        },
        order:		'order',
        count:		false
    },
    results_filter		= {
        where: 		{
            device:	req.headers.device,
            survey: {
                $in: unique_ids
            }
        },
        count:		false
    },
    collection			= 'surveys_entries',
    questCollection 	= 'surveys_questions',
    resultsCollection 	= 'surveys_results';



if (req.method === 'GET') {

    if (req.query && req.query.skip !== undefined && req.query.skip !== null){
        filter.skip = req.query.skip;
    }

    if (req.query && req.query.limit !== undefined && req.query.limit !== null){
        filter.limit = req.query.limit;
    }

    async.waterfall(
        [
            function(icallback) {

                // Permissions
                if (req.user && req.user.email){

                    require('/custom_modules/auth').getUserTags(corus, req.user.email, function(err, user_tags){

                        if (!err && user_tags && user_tags.length > 0){

                            filter.where.$or.push({
                                'tag_filters': {
                                    $in: user_tags
                                }
                            });

                        }

                        icallback(err);

                    });

                } else {
                    icallback();
                }

            },
            function(icallback) {

                corus.apps(process.env.APP).collections(collection).data().get(filter, function(err, result){

                    if (!err && result.array && result.array.length > 0){

                        result.array = result.array.map(function(i){

                            delete i._title;
                            delete i._subTitle;
                            delete i.createdOn;
                            delete i.createdBy;
                            delete i.modifiedBy;

                            i.questions = [];

                            unique_ids.push(i.id);

                            return i;

                        });

                    }

                    icallback(null, result);

                });

            },
            function(main_result, icallback) {

                // Get related Questions
                corus.apps(process.env.APP).collections(questCollection).data().get(children_filter, function(err, result){

                    var all_questions = [];

                    if (!err && result.array && result.array.length > 0){

                        result.array.forEach(function(i){
                            all_questions.push({
                                id:			i.id,
                                parent:		i.parent,
                                title:		i.title,
                                order:		i.order
                            });
                        });

                    }

                    icallback(err, main_result, all_questions);

                });

            },
            function(main_result, all_questions, icallback){

                // Check if this user has already voted
                corus.apps(process.env.APP).collections(resultsCollection).data().get(results_filter, function(err, result){

                    var all_votes = [];

                    if (!err && result.array && result.array.length > 0){

                        result.array.forEach(function(i){
                            all_votes.push({
                                survey:		i.survey,
                                parent:		i.parent,
                            });
                        });

                    }

                    icallback(err, main_result, all_questions, all_votes);

                });

            },
            function(main_result, all_questions, all_votes, icallback){

                if (main_result.array && main_result.array.length > 0){

                    main_result.array.forEach(function(i){

                        var votes = all_votes.filter(function(e){
                            return (e.survey === i.id);
                        });

                        i.questions = all_questions.filter(function(e){
                            return (e.parent === i.id);
                        });

                        i.alreadyVoted = (votes.length > 0);

                    });

                }

                icallback(null, main_result);

            }
        ],
        function(error, response){
            next(error, response);
        }

    );

} else {

    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});

}