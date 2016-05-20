/*
 * REST Resource: v1/directory_categories/:menu_entry
 *
 * URL for this resource: http://lyncat.corus.io/custom/dev_lyncat/v1/directory_categories/:menu_entry
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
            menu_entry:	req.params.menu_entry
        },
        order:		'order',
        skip:		null,
        limit:		null,
        count:		false
    },
    children_filter		= {
        where: 		{
            enabled: 	true,
            '$or':		[{ 'tag_filters':null }, { 'tag_filters':[] }],
            category: {
                $in: unique_ids
            }
        },
        order:		'order',
        count:		false
    },
    collection			= 'directory_categories',
    entriesCollection	= 'directory_entries';



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

                            children_filter.where.$or.push({
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

                            i.image = (i.image) ? 'https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/' + collection + '/data/' + i.id + '/image' : null;

                            unique_ids.push(i.id);

                            return i;

                        });

                    }

                    icallback(null, result);

                });

            },
            function(main_result, icallback) {

                // Get Children Entries
                corus.apps(process.env.APP).collections(entriesCollection).data().get(children_filter, function(err, result){

                    var all_children = [];

                    if (!err && result.array && result.array.length > 0){

                        result.array.forEach(function(i){
                            all_children.push({
                                id:			i.id,
                                menu_entry:	i.menu_entry,
                                category:	i.category,
                            });
                        });

                    }

                    icallback(err, main_result, all_children);

                });

            },
            function(main_result, all_children, icallback){

                if (main_result.array && main_result.array.length > 0){

                    main_result.array.forEach(function(i){

                        i.total = all_children.filter(function(e){
                            return (e.category === i.id);
                        }).length;

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