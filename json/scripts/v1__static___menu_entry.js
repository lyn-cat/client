/*
 * REST Resource: v1/static/:menu_entry
 */

var Corus 				= require('corus'),
    async				= require('async'),
    moment				= require('moment'),
    lang 				= req.query.lang || req.headers.lang || req.cookies.lang || null,
    corus 				= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: lang, fillWithDefaultLang: true}),
    filter				= {
        where: 		{
            menu_entry:		req.params.menu_entry
        },
        count:		false
    },
    children_filter		= {
        where: 		{
            parent:			null
        },
        order:		'order',
        count:		false
    },
    collection			= 'static_entries',
    imagesCollection 	= 'images_entries_static',
    actionsCollection 	= 'actions_entries_static',
    filesCollection 	= 'files_entries_static',
    response			= null;



if (req.method === 'GET') {

    async.waterfall(
        [
            function(icallback) {

                corus.apps(process.env.APP).collections(collection).data().get(filter, function(err, result){

                    if (!err && result.array && result.array.length === 1){

                        delete result.array[0]._title;
                        delete result.array[0]._subTitle;
                        delete result.array[0].createdOn;
                        delete result.array[0].createdBy;
                        delete result.array[0].modifiedBy;
                        response = result.array[0];
                        response.images = [];
                        response.actions = [];
                        response.files = [];

                        response.body = response.body.replace(/\!\[(.*)\]\((.*)\)/gm, function(a){

                            if (a.match(/http:\/\/|https:\/\//gm)){
                                return a;
                            } else {
                                return a.replace(/\!\[(.*)\]\((.*)\)/gm, '![$1](https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/' + collection + '/data/' + response.id + '/body/$2)');
                            }

                        });

                        children_filter.where.parent = response.id;
                        icallback(err);

                    } else {
                        icallback('Not found.');
                    }

                });

            },
            function(icallback) {

                // Get related Images
                corus.apps(process.env.APP).collections(imagesCollection).data().get(children_filter, function(err, result){

                    if (!err && result.array && result.array.length > 0){

                        result.array.forEach(function(i){
                            response.images.push({
                                parent:		i.parent,
                                url: 		'https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/' + imagesCollection + '/data/' + i.id + '/image',
                                caption:	i.caption,
                                order:		i.order
                            });
                        });

                    }

                    icallback(err);

                });

            },
            function(icallback) {

                // Get related Files
                corus.apps(process.env.APP).collections(filesCollection).data().get(children_filter, function(err, result){

                    if (!err && result.array && result.array.length > 0){

                        result.array.forEach(function(i){
                            response.files.push({
                                parent:			i.parent,
                                file: 			'https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/' + filesCollection + '/data/' + i.id + '/file',
                                title:			i.title,
                                description:	i.description,
                                order:			i.order
                            });
                        });

                    }

                    icallback(err);

                });

            },
            function(icallback) {

                // Get related Actions
                corus.apps(process.env.APP).collections(actionsCollection).data().get(children_filter, function(err, result){

                    if (!err && result.array && result.array.length > 0){

                        result.array.forEach(function(i){
                            response.actions.push({
                                parent:		i.parent,
                                action: 	i.action,
                                link:		i.link,
                                order:		i.order
                            });
                        });

                    }

                    icallback(err);

                });

            }
        ],
        function(error){
            next(error, response);
        }

    );

} else {

    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});

}