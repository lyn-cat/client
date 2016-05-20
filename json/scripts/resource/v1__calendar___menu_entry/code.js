/*
 * REST Resource: v1/calendar/:menu_entry
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
            datum: 		{},
            enabled: 	true,
            '$or':		[{ 'tag_filters':null }, { 'tag_filters':[] }]
        },
        order:		'-datum',
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
    collection			= 'calendar_entries',
    imagesCollection 	= 'images_entries_calendar',
    actionsCollection 	= 'actions_entries_calendar',
    filesCollection 	= 'files_entries_calendar',
    ratingCollection 	= 'calendar_entries_rating';



if (req.method === 'GET') {

    if (req.query && req.query.skip !== undefined && req.query.skip !== null){
        filter.skip = req.query.skip;
    }

    if (req.query && req.query.limit !== undefined && req.query.limit !== null){
        filter.limit = req.query.limit;
    }

    if (req.query && req.query.from !== undefined && req.query.from !== null){
        filter.where.datum.$gte = moment(req.query.from, 'YYYYMMDD').toDate();
    } else {
        filter.where.datum.$gte = moment().subtract(1, 'months').date(1).hour(0).minute(0).second(0).millisecond(0).toDate();
    }

    if (req.query && req.query.to !== undefined && req.query.to !== null){
        filter.where.datum.$lte = moment(req.query.to, 'YYYYMMDD').toDate();
    } else {
        filter.where.datum.$lte = moment().add(2, 'months').date(1).hour(0).minute(0).second(0).millisecond(0).toDate();
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

                // Check the already rated activities
                var device_rating_filter = {
                    where: 		{
                        device: req.headers.device,
                        parent: {
                            $in: unique_ids
                        }
                    },
                    limit:		1000000000,
                    count:		false
                };

                corus.apps(process.env.APP).collections(ratingCollection).data().get(device_rating_filter, function(err, result){

                    var all_ratings = [];

                    if (!err && result.array && result.array.length > 0){

                        result.array.forEach(function(i){
                            all_ratings.push({
                                id:			i.id,
                                parent:		i.parent,
                                device: 	i.device,
                                rating:		i.rating
                            });
                        });

                    }

                    icallback(err, main_result, all_images, all_files, all_actions, all_ratings);

                });


            },
            function(main_result, all_images, all_files, all_actions, all_ratings, icallback){

                var days = {};

                if (main_result.array && main_result.array.length > 0){

                    main_result.array.forEach(function(i){

                        var day 	= moment(i.datum).format('YYYYMMDD'),
                            vote 	= all_ratings.filter(function(r){
                                return r.parent === i.id;
                            });

                        if (vote && vote.length > 0){
                            i.alreadyRated = true;
                        } else {
                            i.alreadyRated = false;
                        }

                        i.images = all_images.filter(function(e){
                            return (e.parent === i.id);
                        });

                        i.files = all_files.filter(function(e){
                            return (e.parent === i.id);
                        });

                        i.actions = all_actions.filter(function(e){
                            return (e.parent === i.id);
                        });

                        if (!days[day]){
                            days[day] = [];
                        }

                        days[day].push(i);

                    });

                    for (var d in days){
                        days[d].reverse();
                    }

                }

                icallback(null, days);

            }
        ],
        function(error, response){
            next(error, response);
        }

    );

} else {

    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});

}