/**
 *
 * Versión: 1.0 => First Commit
 *
 */

/**
 *  Requires
 */

var Corus 	= require('corus'),
    menu	= require('/custom_modules/menu'),
    lang 	= req.query.lang || req.headers.lang || req.cookies.lang || null,
    corus 	= new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: req.query.lang || null}),
    userIsAdmin = (req.user && (req.user.isOwner || (['manager', 'developer'].indexOf(req.user.role) !== -1))),
    isFileDownload = (req.method === 'GET' && req.params.field),
    field	= null;


/**
 * Field Info
 * (informed on "lookup fields" calls)
 */

if(req.query.field){

    try { field = JSON.parse(req.query.field); } catch(e) { /* Invalid JSON */ }
    console.log(JSON.stringify(field));

}

/**
 * Shortcut Params
 * (informed on "shortcut" calls)
 */

var shortcutParams = null;

if(req.query.params){

    try { shortcutParams = JSON.parse(req.query.params); } catch(e) { /* Invalid JSON */ }

}

if (!userIsAdmin && !isFileDownload){

    next({statusCode: 403, message: 'Only managers and developers can access this collection'});

} else {

    if(req.method === 'GET'){

        /**
         * GET
         */

        if(!req.params.id){

            /**
             * GET ==> /data
             */

            /**
             * Filter
             *
             *  - where:    (JSON) Represents a mongodb query (can be null).
             *  - skip:     (Integer) Number of records to skip (can be null, default value: 0).
             *  - limit:    (Integer) Number of records to return (can be null, default value: 20).
             *  - count:    (Boolean) If true, query returns total number of records matching the specified criteria.
             *  - search:   (String) Full-text search value
             *  - order:    (String) Delimited list of path names (Ex: field1, -field2, field3). Default: -createdOn
             *  - groupBy:  (JSON) Aggregation expression ($group value of mongodb aggregation pipeline)
             */

            if(!req.filter.where){

                req.filter.where = {};

            }

            //Aplicamos el orden por defecto

            req.filter.order = 'order';

            //Si consultan la colección desde un lookup

            if(field){

                if (field.collection === 'static_entries'){
                    req.filter.where.type = 'static';
                } else if (field.collection === 'static_list_entries'){
                    req.filter.where.type = 'static_list';
                } else if (field.collection === 'calendar_entries'){
                    req.filter.where.type = 'calendar';
                } else if (field.collection === 'news_entries'){
                    req.filter.where.type = 'news';
                } else if (field.collection === 'news_categories'){
                    req.filter.where.type = 'news';
                } else if (field.collection === 'notifications'){
                    req.filter.where.type = 'notifications';
                } else if (field.collection === 'directory_entries'){
                    req.filter.where.type = 'directory';
                } else if (field.collection === 'surveys_entries'){
                    req.filter.where.type = 'survey';
                } else if (field.collection === 'videos_entries'){
                    req.filter.where.type = 'videos';
                }

            }

            //Si consultan la app desde un shortcut

            if(shortcutParams && shortcutParams.app){

                req.filter.where.app = shortcutParams.app;

            }


            corus.apps(process.env.APP).collections(req.params.collection).data().get(req.filter, function(err, result){

                next(err, result);

            });

        } else {

            if(!req.params.field) {

                /**
                 * GET ==> /data/:id
                 */

                corus.apps(process.env.APP).collections(req.params.collection).data(req.params.id).get(function (err, result) {

                    next(err, result);

                });

            } else {

                /**
                 * GET ==> /data/:id/:field (file download)
                 */

                next(null);

            }

        }

    } else if(req.method === 'POST'){

        /**
         * POST
         */

        corus.apps(process.env.APP).collections(req.params.collection).data().post(JSON.parse(req.body), function(err, result){

            next(err, result);

        });

    } else if(req.method === 'PUT'){

        /**
         * PUT
         */

        corus.apps(process.env.APP).collections(req.params.collection).data(req.params.id).put(JSON.parse(req.body), function(err, result){

            if(err && err.statusCode === 404 && req.query.ignore404){

                err = null;

            }

            next(err, result);

        });

    } else if(req.method === 'DELETE'){

        /**
         * DELETE
         */

        corus.apps(process.env.APP).collections(req.params.collection).data(req.params.id).delete(function(err, result){

            next(err, result);

        });

    } else {

        next({statusCode: 400, message: 'Invalid http verb'});

    }

}