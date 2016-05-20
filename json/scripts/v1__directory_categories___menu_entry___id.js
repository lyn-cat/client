/*
 * REST Resource: v1/directory_categories/:menu_entry/:id
 */

var Corus 				= require('corus'),
    async				= require('async'),
    moment				= require('moment'),
    lang 				= req.query.lang || req.headers.lang || req.cookies.lang || null,
    corus 				= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: lang, fillWithDefaultLang: true}),
    unique_ids			= [],
    filter				= {
        where: 		{
            category:	req.params.id,
            enabled: 	true,
            '$or':		[{ 'tag_filters':null }, { 'tag_filters':[] }]
        },
        order:		'title',
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
    collection			= 'directory_entries',
    imagesCollection 	= 'images_entries_directory',
    actionsCollection 	= 'actions_entries_directory',
    filesCollection 	= 'files_entries_directory';

if (req.method === 'GET') {

    if (req.query && req.query.skip !== undefined && req.query.skip !== null){
        filter.skip = req.query.skip;
    }

    if (req.query && req.query.limit !== undefined && req.query.limit !== null){
        filter.limit = req.query.limit;
    }

    if (req.query && req.query.search){
        filter.search = req.query.search;
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

                            i.body = i.body.replace(/\!\[(.*)\]\((.*)\)/gm, function(a){

                                if (a.match(/http:\/\/|https:\/\//gm)){
                                    return a;
                                } else {
                                    return a.replace(/\!\[(.*)\]\((.*)\)/gm, '![$1](https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/' + collection + '/data/' + i.id + '/body/$2)');
                                }

                            });

                            i.images = [];
                            i.actions = [];
                            i.files = [];

                            unique_ids.push(i.id);

                            return i;

                        });

                    }

                    icallback(null, result);

                });

            },
            function(main_result, icallback) {

                // Get related Images
                corus.apps(process.env.APP).collections(imagesCollection).data().get(children_filter, function(err, result){

                    var all_images = [];

                    if (!err && result.array && result.array.length > 0){

                        result.array.forEach(function(i){
                            all_images.push({
                                parent:		i.parent,
                                url: 		'https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/' + imagesCollection + '/data/' + i.id + '/image',
                                caption:	i.caption,
                                order:		i.order
                            });
                        });

                    }

                    icallback(err, main_result, all_images);

                });

            },
            function(main_result, all_images, icallback) {

                // Get related Files
                corus.apps(process.env.APP).collections(filesCollection).data().get(children_filter, function(err, result){

                    var all_files = [];

                    if (!err && result.array && result.array.length > 0){

                        result.array.forEach(function(i){
                            all_files.push({
                                parent:			i.parent,
                                file: 			'https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/' + filesCollection + '/data/' + i.id + '/file',
                                title:			i.title,
                                description:	i.description,
                                order:			i.order
                            });
                        });

                    }

                    icallback(err, main_result, all_images, all_files);

                });

            },
            function(main_result, all_images, all_files, icallback) {

                // Get related Actions
                corus.apps(process.env.APP).collections(actionsCollection).data().get(children_filter, function(err, result){

                    var all_actions = [];

                    if (!err && result.array && result.array.length > 0){

                        result.array.forEach(function(i){
                            all_actions.push({
                                parent:		i.parent,
                                action: 	i.action,
                                link:		i.link,
                                order:		i.order
                            });
                        });

                    }

                    icallback(err, main_result, all_images, all_files, all_actions);

                });

            },
            function(main_result, all_images, all_files, all_actions, icallback){

                if (main_result.array && main_result.array.length > 0){

                    main_result.array.forEach(function(i){

                        i.images = all_images.filter(function(e){
                            return (e.parent === i.id);
                        });

                        i.files = all_files.filter(function(e){
                            return (e.parent === i.id);
                        });

                        i.actions = all_actions.filter(function(e){
                            return (e.parent === i.id);
                        });

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