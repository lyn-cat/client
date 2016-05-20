/*
 * REST Resource: v1/applications
 */

var Corus 			= require('corus'),
    async			= require('async'),
    moment			= require('moment'),
    lang 			= req.query.lang || req.headers.lang || req.cookies.lang || null,
    corus 			= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: lang, fillWithDefaultLang: true}),
    filter			= {
        where: 		{
            enabled: 	true
        },
        order:		'order',
        count:		true
    },
    menu_filter		= {
        where: 		{
            enabled: 	true,
            '$or':		[{ 'tag_filters':null }, { 'tag_filters':[] }]
        },
        order:		'order',
        count:		true
    },
    menu_entries	= {},
    adverts			= {};



if (req.method === 'GET') {

    /*
     *	Get the Lyncat Applications and settings
     *
     */

    async.waterfall(
        [
            function(icallback) {

                // Permissions
                if (req.user && req.user.email){

                    require('/custom_modules/auth').getUserTags(corus, req.user.email, function(err, user_tags){

                        if (!err && user_tags && user_tags.length > 0){

                            menu_filter.where.$or.push({
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
            function(icallback){

                // Lyncat App custom settings
                corus.apps(process.env.APP).get(function(err, app){
                    delete app.createdOn;
                    delete app.createdBy;
                    delete app.modifiedBy;
                    delete app.admins;
                    app.data.loader_image = (app.data.loader_image) ? 'https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/data/loader_image' : null;
                    app.data.profile_background_image = (app.data.profile_background_image) ? 'https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/data/profile_background_image' : null;
                    icallback(err, app);
                });

            },
            function(app, icallback){

                // Applications list
                corus.apps(process.env.APP).collections('subapps').data().get(filter, function(err, res){

                    if (res.array && res.array.length){
                        res.array.map(function(a){
                            delete a._title;
                            delete a._subTitle;
                            delete a.createdOn;
                            delete a.createdBy;
                            delete a.modifiedBy;
                            a.image = (a.image) ? 'https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/subapps/data/' + a.id + '/image' : null;
                            a.sidemenu_logo_image = (a.sidemenu_logo_image) ? 'https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/subapps/data/' + a.id + '/sidemenu_logo_image' : null;
                            return a;
                        });
                    }

                    icallback(err, app, res);

                });

            },
            function(app, subapps, icallback){

                // Applications menu entries
                if (subapps.array && subapps.array.length){

                    corus.apps(process.env.APP).collections('app_menu').data().get(menu_filter, function(err, res){

                        console.log('menu_entries: ' + JSON.stringify(res));

                        if (res.array && res.array.length){

                            res.array.forEach(function(m){

                                delete m._title;
                                delete m._subTitle;
                                delete m.createdOn;
                                delete m.createdBy;
                                delete m.modifiedBy;

                                switch(m.type){
                                    case 'static':
                                        m.controller = '/controllers/layouts/static';
                                        break;
                                    case 'static_list':
                                        m.controller = '/controllers/layouts/static_list';
                                        break;
                                    case 'directory':
                                        m.controller = '/controllers/layouts/directory';
                                        break;
                                    case 'videos':
                                        m.controller = '/controllers/layouts/videos';
                                        break;
                                    case 'survey':
                                        m.controller = '/controllers/layouts/survey';
                                        break;
                                    case 'notifications':
                                        m.controller = '/controllers/layouts/notifications';
                                        break;
                                    case 'news':
                                        m.controller = '/controllers/layouts/news';
                                        break;
                                    case 'calendar':
                                        m.controller = '/controllers/layouts/calendar';
                                        break;
                                }

                                if (!menu_entries[m.app]){
                                    menu_entries[m.app] = [];
                                }

                                menu_entries[m.app].push(m);

                            });

                        }

                        icallback(err, app, subapps);

                    });

                } else {
                    icallback(null, app, subapps);
                }

            },
            function(app, subapps, icallback){

                // Get the available adverts
                if (subapps.array && subapps.array.length){

                    corus.apps(process.env.APP).collections('adverts').data().get(filter, function(err, ads){

                        if (ads.array && ads.array.length){

                            ads.array.forEach(function(a){

                                delete a._title;
                                delete a._subTitle;
                                delete a.createdOn;
                                delete a.createdBy;
                                delete a.modifiedBy;
                                a.image = (a.image) ? 'https://' + process.env.HOST + '/api/v1/apps/' + process.env.APP + '/collections/adverts/data/' + a.id + '/image' : null;

                                if (!adverts[a.app]){
                                    adverts[a.app] = [];
                                }

                                adverts[a.app].push(a);

                            });

                        }

                        icallback(err, app, subapps);

                    });

                } else {
                    icallback(null, app, subapps);
                }

            },
            function(app, subapps, icallback){

                // Cook the results
                if (subapps.array && subapps.array.length){

                    subapps.array.map(function(a){
                        a.menu_entries = menu_entries[a.id] || null;
                        a.adverts = adverts[a.id] || null;
                        return a;
                    });

                }

                icallback(null, app, subapps);

            }
        ],
        function(error, app, subapps){
            next(error, {
                settings:		app,
                applications:	subapps.array,
                count:			subapps.count
            });
        }
    );

} else {

    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});

}