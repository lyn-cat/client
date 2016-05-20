/*
 * REST Resource: v1/notifications/:menu_entry
 *
 * Versión: 1.0 => First Commit
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
            published: 	true,
            is_sent:	true,
            '$or':		[{ 'tag_filters':null }, { 'tag_filters':[] }],
            result_datum: {
                '$gte':	moment().subtract(7, 'days').toDate()
            }
        },
        order:		'-result_datum',
        skip:		null,
        limit:		null,
        count:		false
    },
    collection			= 'notifications';



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

                            return i;

                        });

                    }

                    icallback(null, result);

                });

            }
        ],
        function(error, response){
            next(error, response);
        }

    );

} else {

    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});

}