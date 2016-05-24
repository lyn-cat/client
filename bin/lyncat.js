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
var Spinner = require('cli-spinner').Spinner;
var colors = require('colors');
var Table = require('cli-table');
var ProgressBar = require('progress');

/**
 * Properties
 */

var DOWNLOADS_FOLDER =  path.join(__dirname, '/../files');
var CURRENT_CORPORATE = null;
var CURRENT_HOST = null;
var CURRENT_APP = null;
var CURRENT_KEY = null;

/**
 * Private Methods
 */



/**
 * Promp Methods
 */

var askCorporate = function(callback){

    program.promptSingleLine(colors.red('1)') + ' Corporate que quieres actualizar (ej:tecnocampus): ', function(i){

        if(i) {

            CURRENT_CORPORATE = i;
            CURRENT_HOST = CURRENT_CORPORATE + '.corus.io';
            return callback(null);

        } else {

            askHost(callback);

        }

    });

};

var askApp = function(callback){

    program.promptSingleLine(colors.red('2)') + ' App que quieres actualizar (ej:dev-lyncat): ', function(i){


        if(i) {

            CURRENT_APP = i;
            return callback(null);

        } else {

            askApp(callback);

        }

    });

};

var askKey = function(callback){

    program.password(colors.red('3)') + ' Key de usuario Super-Administrador de ' + CURRENT_HOST + ': ', '*', function(i){

        CURRENT_KEY = i;
        return callback(null);

    });

};

/**
 * Init
 */

// Indicamos cual será el spinner por defecto

Spinner.setDefaultSpinnerString(18);

async.waterfall(

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

                    console.log(colors.red(data));
                    console.log('\n');
                    console.log('Se actualizará lyncat con los archivos que hay en: ' + colors.red(DOWNLOADS_FOLDER));
                    console.log('\n');

                }

                return cb(err);

            });

        },

        function(cb){

            //Guardamos el valor de CURRENT_CORPORATE

            askCorporate(function(err){

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

            //Guardamos el valor de CURRENT_KEY

            askKey(function(err){

                return cb(err);

            });

        },

        function(cb){

            var json = lyncat.getUpdateJSON(DOWNLOADS_FOLDER, CURRENT_CORPORATE);

            console.log(colors.red('4) Se actualizarán los siguientes items...\n'));

            var table = new Table({

                head: ['Tipo', 'Slug', 'Default?'],
                colWidths: [20, 60, 10]

            });

            table.push(['app fields', '-', json.app.appFields.default ? colors.green('Si') : colors.red('No')]);

            table.push(['user fields', '-', json.app.userFields.default ? colors.green('Si') : colors.red('No')]);

            table.push(['npm modules', '-', json.app.modules.default ? colors.green('Si') : colors.red('No')]);

            Object.keys(json.collections).forEach(function(slug){

                table.push(['collection', slug, json.collections[slug].default ? colors.green('Si') : colors.red('No')]);

            });

            Object.keys(json.scripts).forEach(function(slug){

                table.push([json.scripts[slug].type, slug, json.scripts[slug].default ? colors.green('Si') : colors.red('No')]);

            });

            console.log(table.toString() + '\n');

            program.promptSingleLine(colors.red('5) ') + 'Se actualizará la app ' + colors.red(CURRENT_APP) + ' del host ' + colors.red(CURRENT_HOST) + ': ¿Quieres continuar? [ ' + colors.green('yes') + ' / ' + colors.red('no') + ' ]: ', function(ok){

                if(ok !== 'yes'){

                    console.log('\n');
                    process.exit(0);

                } else {

                    return cb(null, json);

                }

            });

        },

        function(json, cb){

            var updatesCount = lyncat.patch(json, {

                host: CURRENT_HOST,

                app: CURRENT_APP,

                progress: function(){

                    bar.tick();

                }

            }, function(err){

                return cb(err);

            });

            var bar = new ProgressBar('   [:bar]  ' + colors.green(':percent') + ' (' + colors.green(':etas') + ')' , {

                complete: '=',
                incomplete: '-',
                total: updatesCount,
                width:84

            });

        }

    ],

    function(err){

        if(err){

            console.error(JSON.stringify(err));

        } else {

            process.exit(0);

        }

    }

);




