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

var DOWNLOADS_FOLDER =  path.join(os.homedir(), '/lyncat/downloads');
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
 * Promp Methods
 */

var askHost = function(callback){

    program.promptSingleLine(colors.magenta('1)') + ' Host al que quieres conectar (ej:lyncat.corus.io): ', function(i){

        if(i) {

            CURRENT_HOST = i;
            return callback(null);

        } else {

            askHost(callback);

        }

    });

};

var askApp = function(callback){

    program.promptSingleLine(colors.magenta('2)') + ' App que quieres descargar/actualizar (ej:dev-lyncat): ', function(i){


        if(i) {

            CURRENT_APP = i;
            return callback(null);

        } else {

            askApp(callback);

        }

    });

};

var askKey = function(callback){

    program.password(colors.magenta('2)') + ' Key de usuario Super-Administrador de ' + CONFIG.HOST + ': ', '*', function(i){

        CURRENT_KEY = i;
        return callback(null);

    });

};

var askPassword = function(callback){

    program.password(colors.magenta('4)') + ' Password de usuario Super-Administrador de ' + CURRENT_HOST + ': ', '*', function(i){

        CURRENT_PASSWORD = i;
        return callback(null);

    });

};



/**
 * Init
 */


// Indicamos cual será el spinner por defecto

Spinner.setDefaultSpinnerString(18);

async.series(

    [

        function(cb){

            exec('clear', function(error, stdout, stderr){

                util.puts(stdout);
                return cb(null);

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

            //Pintamos un ASCII molón por pantalla

            figlet('Lyncat', function(err, data) {

                if(!err){

                    console.log(colors.magenta(data));
                    console.log('\n');

                }

                return cb(err);

            });

        },

        function(cb){

            //Guardamos el valor de CURRENT_HOST

            askHost(function(err){

                return cb(err);

            });

        },

        function(cb){

            //Guardamos el valor de CURRENT_APP

            askApp(function(err){

                return cb(err);

            });

        },

        function(cb){

            //Guardamos el valor de CURRENT_SOURCE_PASSWORD

            askKey(function(err){

                return cb(err);

            });

        },

        function(cb){

            //Guardamos el valor de CURRENT_PASSWORD

            askPassword(function(err){

                return cb(err);

            });

        },

        function(cb){

            var spinner = new Spinner('Descargando versión actual desde ' + CONFIG.HOST + '...');
            spinner.start();




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




