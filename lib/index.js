/**
 * Lyncat Client
 * Copyright (c) 2016 Lyn.cat <juancarlos.vinas@lyn.cat>
 * MIT Licensed
 */

/*
 * Requires
 */

var request = require('request');
var async  = require('async');
var packageJson = require('../package.json');

/**
 * Constants
 */

var CONFIG = packageJson.config;

/**
 * HttpError
 */

var HttpError = function(statusCode, message){

    Error.call(this);

    this.message = message || 'Unknown error';

    this.statusCode = statusCode || 500;

};

/**
 * Private Methods
 */

var invoke = function(options, bodyOrFilter, callback){

        if(!callback){

            callback = bodyOrFilter;
            bodyOrFilter = null;

        }

        if(!callback){

            callback = function(){};

        }

        if(bodyOrFilter) {

            if (options.method === 'POST' || options.method === 'PUT') {

                options = assign({}, options, {json: true, body: bodyOrFilter});

            }

        }

        request(options, function(err, response, body){

            if(err){

                callback(err);

            } else if(response.statusCode < 200 || response.statusCode >= 400) {

                callback(new HttpError(response.statusCode, body));

            } else {

                var jsonBody = body;

                try { jsonBody = JSON.parse(body); } catch(e){}

                callback(null, jsonBody);

            }

        });

    };

var clearMetadata = function(obj){

    delete obj.id;
    delete obj.createdOn;
    delete obj.createdBy;
    delete obj.modifiedOn;
    delete obj.modifiedBy;
    return obj;

};

var clearCollection = function(collection){

    collection = clearMetadata(collection);

    delete collection.app;
    delete collection.langs;

    collection.fields.forEach(function(item){

        delete item.app;

    });

    return collection;

};

var clearScript = function(script){

    script = clearMetadata(script);
    delete script.app;
    delete script.lastExecutionOn;
    delete script.lockedBy;
    return script;

};

var clearFields = function(fields){

    fields.forEach(function(item){

        delete item.app;

    });

    return fields;

};

/**
 * Public Methods
 */

exports.download = function(options, callback){

    async.parallel(

        {

            collections: function(cb){

                invoke({

                    method: 'GET',
                    url: 'http://' + CONFIG.HOST + '/api/v1/apps/' + CONFIG.APP + '/collections',
                    headers: {
                        key: options.key
                    }

                }, function(err, body){

                    if(err){

                        return cb(err);

                    } else {

                        (function processCollection(index){

                            if(index >= body.length){

                                return cb(null, body);

                            } else {

                                var collection = body[index];

                                invoke({

                                    method: 'GET',
                                    url: 'http://' + CONFIG.HOST + '/api/v1/apps/' + CONFIG.APP + '/collections/' + collection.slug,
                                    headers: {
                                        key: options.key
                                    }

                                }, function(err, collectionDetail){

                                    if(err){

                                        return cb(err);

                                    } else {

                                        body[index] = clearCollection(collectionDetail);
                                        processCollection(index+1);

                                    }

                                });

                            }

                        })(0)

                    }

                });

            },

            scripts: function(cb){

                invoke({

                    method: 'GET',
                    url: 'http://' + CONFIG.HOST + '/api/v1/apps/' + CONFIG.APP + '/scripts',
                    headers: {
                        key: options.key
                    }

                }, function(err, body){

                    if(err){

                        return cb(err);

                    } else {

                        (function processScript(index){

                            if(index >= body.length){

                                return cb(null, body);

                            } else {

                                var script = body[index];

                                invoke({

                                    method: 'GET',
                                    url: 'http://' + CONFIG.HOST + '/api/v1/apps/' + CONFIG.APP + '/scripts/' + encodeURIComponent(script.slug),
                                    headers: {
                                        key: options.key
                                    }

                                }, function(err, scriptDetail){

                                    if(err){

                                        return cb(err);

                                    } else {

                                        body[index] = clearScript(scriptDetail);
                                        processScript(index+1);

                                    }

                                });

                            }

                        })(0)

                    }

                });

            },

            appFields:function(cb){

                invoke({

                    method: 'GET',
                    url: 'http://' + CONFIG.HOST + '/api/v1/apps/' + CONFIG.APP + '/appFields',
                    headers: {
                        key: options.key
                    }

                }, function(err, body){

                    if(err){

                        return cb(err);

                    } else {

                        return cb(null, clearFields(body));

                    }

                });

            },

            userFields:function(cb){

                invoke({

                    method: 'GET',
                    url: 'http://' + CONFIG.HOST + '/api/v1/apps/' + CONFIG.APP + '/userFields',
                    headers: {
                        key: options.key
                    }

                }, function(err, body){

                    if(err){

                        return cb(err);

                    } else {

                        return cb(null, clearFields(body));

                    }

                });

            }

        },

        function(err, result){

            callback(err, result);

        }

    );

};

