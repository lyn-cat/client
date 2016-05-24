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
var CURRENT_COMMAND = null;
var CURRENT_HOST = null;
var CURRENT_APP = null;
var CURRENT_KEY = null;
var CURRENT_PASSWORD = null;
var CURRENT_DOWNLOAD_FOLDER = null;
var CONFIG = packageJson.config;

/**
 * Private Methods
 */


/**
 * Constants
 */

var ADMIN_KEY = '';


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

                        var collectionFolder = collectionsFolder + '/' + item.slug;

                        fs.ensureDirSync(collectionFolder);

                        fs.writeJsonSync(collectionFolder + '/default.json', item, {spaces: 4});

                    });

                    //Creamos los scripts

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




