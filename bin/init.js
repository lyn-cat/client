#!/usr/bin/env node

/*
 * Requires
 */

var lyncat = require('../lib');
var async = require('async');
var program = require('commander-plus');
var figlet = require('figlet');
var os = require('os');
var path = require('path');
var fs = require('fs-extra');
var moment = require('moment');
var util = require('util');
var exec = require('child_process').exec;
var packageJson = require('../package.json');
var Spinner = require('cli-spinner').Spinner;
var colors = require('colors');

/**
 * Properties
 */

var DOWNLOADS_FOLDER =  path.join(__dirname, '/../files');
var ADMIN_KEY = '';

/**
 * Private Methods
 */

var cleanSlug = function(slug){

    return slug.replace(new RegExp('/:', 'g'), '___').replace(new RegExp('/', 'g'), '__');

};

var cleanScript = function(json){

    delete json.type;
    delete json.code;
    return json;

};

/**
 * Init
 */

async.series(

    [

        function(cb){

            //Eliminamos la carpeta

            fs.remove(DOWNLOADS_FOLDER, function(err){

                return cb(err);

            });

        },

        function(cb){

            //Creamos la carpeta de descargas si no existe

            fs.ensureDir(DOWNLOADS_FOLDER, function(err){

                return cb(err);

            });

        },

        function(cb){

            //Chequeamos que tengamos permisos para read/write

            fs.access(DOWNLOADS_FOLDER, fs.R_OK | fs.W_OK, function(err){

                return cb(err);

            });

        },

        function(cb){

            lyncat.download({key: ADMIN_KEY}, function(err, json){

                if(err){

                    return cb(err);

                } else {

                    //Creamos las colecciones

                    var collectionsFolder = DOWNLOADS_FOLDER + '/collections';

                    fs.ensureDirSync(collectionsFolder);

                    json.collections.forEach(function(item){

                        var collectionFolder = collectionsFolder + '/' + item.slug + '/default';

                        fs.ensureDirSync(collectionFolder);

                        fs.writeJsonSync(collectionFolder + '/settings.json', item, {spaces: 4});

                    });

                    //Creamos los scripts

                    var scriptsFolder = DOWNLOADS_FOLDER + '/scripts';

                    fs.ensureDirSync(scriptsFolder);

                    //Creamos una carpeta por cada tipo de script

                    fs.ensureDirSync(scriptsFolder + '/collectionTrigger');

                    fs.ensureDirSync(scriptsFolder + '/resource');

                    fs.ensureDirSync(scriptsFolder + '/system');

                    fs.ensureDirSync(scriptsFolder + '/scheduledTask');

                    //Creamos una carpeta por cada script

                    json.scripts.forEach(function(item){

                        var scriptFolder = scriptsFolder + '/' + item.type  + '/' + cleanSlug(item.slug) + '/default';

                        fs.ensureDirSync(scriptFolder);

                        fs.writeJsonSync(scriptFolder + '/code.js', item.code, {spaces: 4});

                        fs.writeJsonSync(scriptFolder + '/settings.json', cleanScript(item), {spaces: 4});

                    });

                    //Creamos la carpeta para settings de app

                    var appFolder = DOWNLOADS_FOLDER + '/app/default';

                    fs.ensureDirSync(appFolder);

                    fs.writeJsonSync(appFolder + '/appFields.json', json.appFields, {spaces: 4});

                    fs.writeJsonSync(appFolder + '/userFields.json', json.userFields, {spaces: 4});

                    return cb(null);

                }

            });

        }

    ],

    function(err){

        if(err){

            console.error(JSON.stringify(err));

        } else {

            return;

        }

    }

);




