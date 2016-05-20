/*
 * REST Resource: v1/news/:menu_entry/categories
 *
 * Versión: 1.0 => First Commit
 *
 */

var Corus 				= require('corus'),
    async				= require('async'),
    moment				= require('moment'),
    lang 				= req.query.lang || req.headers.lang || req.cookies.lang || null,
    corus 				= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: lang, fillWithDefaultLang: true}),
    filter				= {
        where: 		{
            menu_entry:	req.params.menu_entry
        },
        order:		'order',
        skip:		null,
        limit:		null,
        count:		false
    },
    collection			= 'news_categories';

if (req.method === 'GET') {

    if (req.query && req.query.skip !== undefined && req.query.skip !== null){
        filter.skip = req.query.skip;
    }

    if (req.query && req.query.limit !== undefined && req.query.limit !== null){
        filter.limit = req.query.limit;
    } else {
        filter.limit = 50;
    }

    async.waterfall(
        [
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