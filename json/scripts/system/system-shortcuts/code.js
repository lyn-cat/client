/*
 * System Script: system-shortcuts
 *
 * Versión: 1.0 => First Commit
 *
 * Execution Environment:
 *
 *  - process.env.HOST:     The host where this script is running.
 *  - process.env.APP:      The slug of the app that contains this trigger.
 *  - process.env.USER:     The email of the user who is invoking this script.
 *  - process.env.KEY:      The key to impersonate a "developer" user on this app.
 *
 * Request Parameters:
 *
 *  - req.user:             (JSON) JSON representing the user who invokes the script.
 *  - req.cookies:          (JSON) Cookies JSON object
 *
 */

var Corus 		= require('corus'),
    async		= require('async'),
    lang 		= req.query.lang || req.headers.lang || req.cookies.lang || null,
    corus 		= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: lang, fillWithDefaultLang: true});


if (req.method === 'GET') {

    //shortcuts.push({type: 'separator', name: 'Menu 1'});
    //shortcuts.push({type: 'collection', name: 'Friendly Name 1', target: 'collection_slug_1', params: {param1: 'value1'}});
    //shortcuts.push({type: 'collection', name: 'Friendly Name 2', target: 'collection_slug_2', params: {param2: 'value2'}});
    //shortcuts.push({type: 'separator', name: 'Menu 2'});
    //shortcuts.push({type: 'collection', name: 'Friendly Name 3', target: 'collection_slug_3', params: {}});
    //shortcuts.push({type: 'collection', name: 'Friendly Name 4', target: 'collection_slug_4', params: {param4: 'value4'}});

    async.waterfall(
        [
            function(cb){

                var filter = {
                    order:	'order',
                    count:	false
                };

                // Cerquem totes les sub aplicacions de Lyncat

                corus.apps(process.env.APP).collections('subapps').data().get(filter, function(err, result){

                    return cb(err, result ? result.array : null);

                });

            },

            function(subapps, cb){

                var shortcuts = [];

                shortcuts.push({type: 'separator', name: 'Settings'});

                shortcuts.push({type: 'collection', name: 'Applications', target: 'subapps', params: {}});
                shortcuts.push({type: 'collection', name: 'Layout Types', target: 'layout_types', params: {}});
                shortcuts.push({type: 'collection', name: 'Actions', target: 'actions', params: {}});
                shortcuts.push({type: 'collection', name: 'User Tags', target: 'user_tags', params: {}});

                shortcuts.push({type: 'separator', name: 'Applications'});

                subapps.forEach(function(app, appIndex){

                    shortcuts.push({name: app.title, items: [

                        {type: 'collection', name: 'Applications main menu', target: 'app_menu', params: {app: app.id}},

                        {name: 'Plain Pages', items: [

                            {type: 'collection', name: 'Pages', target: 'static_entries', params: {app: app.id}},
                            {type: 'collection', name: 'Pages in lists', target: 'static_list_entries', params: {app: app.id}},

                        ]},

                        {type: 'collection', name: 'Calendar entries', target: 'calendar_entries', params: {app: app.id}},

                        {name: 'News', items: [

                            {type: 'collection', name: 'News', target: 'news_entries', params: {app: app.id}},
                            {type: 'collection', name: 'Categories', target: 'news_categories', params: {app: app.id}},

                        ]},

                        {type: 'collection', name: 'Videos', target: 'videos_entries', params: {app: app.id}},
                        {type: 'collection', name: 'Surveys', target: 'surveys_entries', params: {app: app.id}},

                        {name: 'Places & Peoples', items: [

                            {type: 'collection', name: 'Entries', target: 'directory_entries', params: {app: app.id}},
                            {type: 'collection', name: 'Categories', target: 'directory_categories', params: {app: app.id}},

                        ]},

                        {type: 'collection', name: 'Notifications', target: 'notifications', params: {app: app.id}},
                        {type: 'collection', name: 'Adverts', target: 'adverts', params: {app: app.id}}

                    ]});

                });

                return cb(null, shortcuts);

            }
        ],

        function(error, shortcuts){

            next(error, shortcuts);

        }
    );

} else {

    next({statusCode: 400, message: 'Invalid HTTP verb: ' + req.method});

}