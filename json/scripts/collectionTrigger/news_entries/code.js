/**
 *
 * Versión: 1.0 => First Commit
 *
 */


/**
 *  Requires
 */

var Corus = require('corus');
var menu = require('/custom_modules/menu');

/**
 * Request and Response
 *
 * - req:   A Node.js request object (http.ClientRequest)
 * - res:   A Node.js response object (http.ClientResponse)
 * - next:  Like "next" connect/express function: next(err, result)
 */

/**
 * Execution Environment:
 *
 *  - process.env.HOST:     The host where this script is running.
 *  - process.env.APP:      The slug of the app that contains this trigger.
 *  - process.env.USER:     The email of the user who is invoking this script.
 *  - process.env.KEY:      The key to impersonate a "developer" user on this app.
 */

/**
 * Request Parameters:
 *
 *  - req.user:                    (JSON) JSON representing the user who invokes the script.
 *  - req.filter:                  (JSON) JSON representing the filter to apply (can be null).
 *  - req.query:                   (JSON) Query String object
 *  - req.params.collection:       (String) Slug of the collection attached to this trigger.
 *  - req.params.id:               (String) Id of the item involved (can be null).
 *  - req.params.field:            (String) Name of the field (only informed on "file" operations)
 */

/**
 *  Corus Client
 */

var corus = new Corus({host: process.env.HOST, key: process.env.KEY, avoidTrigger: true, lang: req.query.lang || null});

/**
 * Private Properties
 */

var userIsAdmin = (req.user && (req.user.isOwner || (['manager', 'developer'].indexOf(req.user.role) !== -1)));

var isFileDownload = (req.method === 'GET' && req.params.field);

/**
 * Field Info
 * (informed on "lookup fields" calls)
 */

var field = null;

if(req.query.field){

    try { field = JSON.parse(req.query.field); } catch(e) { /* Invalid JSON */ }

}

/**
 * Shortcut Params
 * (informed on "shortcut" calls)
 */

var shortcutParams = null;

if(req.query.params){

    try { shortcutParams = JSON.parse(req.query.params); } catch(e) { /* Invalid JSON */ }

}

/**
 * Trigger Code
 */


if(!userIsAdmin && !isFileDownload){

    /**
     *  Check Permissions
     */

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

            menu.setAppFilter(corus, shortcutParams ? shortcutParams.app : null, req.filter, function(err, ids){

                if(err){

                    next(err);

                } else {

                    corus.apps(process.env.APP).collections(req.params.collection).data().get(req.filter, function(err, result){

                        next(err, result);

                    });

                }

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

        /**
         * Invalid verb!
         */

        next({statusCode: 400, message: 'Invalid http verb'});

    }

}