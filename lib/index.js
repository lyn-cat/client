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
var fs = require('fs-extra');
var assign = require('object-assign');

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

    collection.fields = collection.fields.filter(function(item){

        return item.type !== 'reverseLookup';

    });

    return collection;

};

var clearScript = function(script){

    script = clearMetadata(script);
    delete script.app;
    delete script.lastExecutionOn;
    delete script.nextExecutionOn;
    delete script.lockedBy;
    return script;

};

var clearFields = function(fields){

    fields.forEach(function(item){

        delete item.id;
        delete item.app;
        delete item.entity;
        delete item.slug;

    });

    return fields.filter(function(item){

        return item.type !== 'reverseLookup';

    });

};

var clearModules = function(modules){

    return modules.map(function(item){

        return {

            name: item.name,
            version: item.version

        }

    });

};

var normalizeSlug = function(slug){

    return slug.replace(new RegExp('___', 'g'), '/:').replace(new RegExp('__', 'g'), '/');

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

            },

            modules: function(cb){

                invoke({

                    method: 'GET',
                    url: 'http://' + CONFIG.HOST + '/api/v1/apps/' + CONFIG.APP + '/modules',
                    headers: {
                        key: options.key
                    }

                }, function(err, body){

                    if(err){

                        return cb(err);

                    } else {

                        return cb(null, clearModules(body));

                    }

                });

            }

        },

        function(err, result){

            callback(err, result);

        }

    );

};

exports.getUpdateJSON = function(folder, corporate){

    var result = {};

    //Leemos Settings de Apps

    var appFolder = folder + '/app';

    result.app = {};

    //Leemos Fields de App

    if(corporate && (fs.existsSync(appFolder + '/' + corporate + '/appFields.json'))){

        result.app.appFields = {

            json: JSON.parse(fs.readFileSync(appFolder + '/' + corporate + '/appFields.json', {encoding: 'utf8'})),
            default: false

        }

    } else {

        result.app.appFields = {

            json: JSON.parse(fs.readFileSync(appFolder + '/default/appFields.json', {encoding: 'utf8'})),
            default: true

        }

    }

    //Leemos Fields de User

    if(corporate && (fs.existsSync(appFolder + '/' + corporate + '/userFields.json'))){

        result.app.userFields = {

            json: JSON.parse(fs.readFileSync(appFolder + '/' + corporate + '/userFields.json', {encoding: 'utf8'})),
            default: false

        }

    } else {

        result.app.userFields = {

            json: JSON.parse(fs.readFileSync(appFolder + '/default/userFields.json', {encoding: 'utf8'})),
            default: true

        }

    }

    //Leemos Modulos npm

    if(corporate && (fs.existsSync(appFolder + '/' + corporate + '/modules.json'))){

        result.app.modules = {

            json: JSON.parse(fs.readFileSync(appFolder + '/' + corporate + '/modules.json', {encoding: 'utf8'})),
            default: false

        }

    } else {

        result.app.modules = {

            json: JSON.parse(fs.readFileSync(appFolder + '/default/modules.json', {encoding: 'utf8'})),
            default: true

        }

    }

    //Leemos colecciones

    var collectionsFolder = folder + '/collections';

    result.collections = {};

    fs.readdirSync(collectionsFolder).forEach(function(child) {

        var collectionFolder = collectionsFolder + '/' + child;

        if(corporate && (fs.existsSync(collectionFolder + '/' + corporate + '/settings.json'))){

            result.collections[child] = {

                json: JSON.parse(fs.readFileSync(collectionFolder + '/' + corporate + '/settings.json', {encoding: 'utf8'})),
                default: false

            }

        } else {

            result.collections[child] = {

                json: JSON.parse(fs.readFileSync(collectionFolder + '/default/settings.json', {encoding: 'utf8'})),
                default: true

            }

        }

    });

    //Leemos scripts

    var scriptsFolder = folder + '/scripts';

    result.scripts = {};

    //Leemos folder por cada tipo

    ['resource', 'collectionTrigger', 'scheduledTask', 'module', 'system'].forEach(function(type){

        var typeFolder = scriptsFolder + '/' + type;

        fs.readdirSync(typeFolder).forEach(function(child) {

            var scriptFolder = typeFolder + '/' + child;

            var scriptJson = {};

            //Leemos Settings

            if(corporate && (fs.existsSync(scriptFolder + '/' + corporate + '/settings.json'))){

                scriptJson = {

                    json: JSON.parse(fs.readFileSync(scriptFolder + '/' + corporate + '/settings.json', {encoding: 'utf8'})),
                    type: type,
                    default: false

                }

            } else {

                scriptJson = {

                    json: JSON.parse(fs.readFileSync(scriptFolder + '/default/settings.json', {encoding: 'utf8'})),
                    type: type,
                    default: true

                }

            }

            //Leemos Código

            if(corporate && (fs.existsSync(scriptFolder + '/' + corporate + '/code.js'))){

                scriptJson.code = fs.readFileSync(scriptFolder + '/' + corporate + '/code.js', {encoding: 'utf8'});
                scriptJson.default = false;

            } else {

                scriptJson.code = fs.readFileSync(scriptFolder + '/default/code.js', {encoding: 'utf8'});

            }

            result.scripts[normalizeSlug(child)] = scriptJson;

        });


    });


    return result;

};

exports.patch = function(json, options, callback){

    var updates = [];

    //App Fields

    updates.push({

        url: 'http://' + options.host + '/api/v1/apps/' + options.app + '/appFields',
        method: 'PUT',
        body: json.app.appFields.json

    });

    //User Fields

    updates.push({

        url: 'http://' + options.host + '/api/v1/apps/' + options.app + '/userFields',
        method: 'PUT',
        body: json.app.userFields.json

    });

    //Modules Fields

    json.app.modules.json.forEach(function(module){

        updates.push({

            url: 'http://' + options.host + '/api/v1/apps/' + options.app + '/modules/' + module.name,
            method: 'PUT',
            body: null

        });

    });

    //Collections

    Object.keys(json.collections).forEach(function(collection){

        var item = json.collections[collection].json;

        updates.push({

            url: 'http://' + options.host + '/api/v1/apps/' + options.app + '/collections/' + item.slug,
            method: 'PUT',
            body: item,
            fallback: {
                url: 'http://' + options.host + '/api/v1/apps/' + options.app + '/collections',
                method: 'POST',
                body: item,
            }

        });

    });

    //Scripts

    Object.keys(json.scripts).forEach(function(script){

        var item = json.scripts[script].json;

        delete item.type;

        updates.push({

            url: 'http://' + options.host + '/api/v1/apps/' + options.app + '/scripts/' + encodeURIComponent(item.slug),
            method: 'PUT',
            body: item,
            fallback: {
                url: 'http://' + options.host + '/api/v1/apps/' + options.app + '/scripts',
                method: 'POST',
                body: assign({}, item, {type: json.scripts[script].type})
            }

        });

    });

    //Process Puts

    (function processPut(index, fallback){

        if(index >= updates.length){

            return callback(null);

        } else {

            var update = updates[index];

            if(fallback){

                update = update.fallback;

            }

            invoke({

                method: update.method,
                url: update.url,
                headers:{
                    key: options.key
                }

            }, update.body, function(err){

                if(err && !(err.statusCode == 404 && update.fallback)){

                    err.update = update;
                    return callback(err);

                } else {

                    if(!err) {

                        if (options.progress) {

                            options.progress();

                        }

                        processPut(index+1);

                    } else {

                        processPut(index, true);

                    }

                }

            });

        }

    })(0);

    //Return Put Counter

    return updates.length;

};

