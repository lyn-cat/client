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

/**
 * Properties
 */

var DOWNLOADS_FOLDER =  path.join(os.homedir(), '/lyncat/downloads');
var COMMANDS = ['download', 'update'];
var CURRENT_COMMAND = null;
var CURRENT_HOST = null;
var CURRENT_APP = null;
var CURRENT_PASSWORD = null;
var CURRENT_DOWNLOAD_FOLDER = null;

/**
 * Private Methods
 */


/**
 * Promp Methods
 */

var askCommand = function(callback){

    console.log('\n¡Hola! Esta es la herramienta cliente de Lyncat.');

    console.log('\nElige que quieres hacer: Descargar (download) o Actualizar (update): \n');

    program.choose(COMMANDS, function(i){

        CURRENT_COMMAND = COMMANDS[i];
        return callback(null);

    });

};

var askHost = function(callback){

    program.promptSingleLine('\nHost al que quieres conectar (ej:lyncat.corus.io): ', function(i){

        CURRENT_HOST = i;
        return callback(null);

    });

};

var askApp = function(callback){

    program.promptSingleLine('\nApp que quieres descargar/actualizar (ej:dev-lyncat): ', function(i){

        CURRENT_APP = i;
        return callback(null);

    });

};

var askPassword = function(callback){

    program.password('\nPassword de usuario Super-Administrador: ', '*', function(i){

        CURRENT_PASSWORD = i;
        return callback(null);

    });

};

var askDownload = function(callback){

    async.waterfall(

        [

            function(cb){

                var downloadName = CURRENT_HOST.replace('.', '__') + '-' + CURRENT_APP + '-' + (moment().format('YYYYMMDDHHmmss'));

                CURRENT_DOWNLOAD_FOLDER = path.join(DOWNLOADS_FOLDER, downloadName);

                program.confirm('\nSe descargará en en ' + CURRENT_DOWNLOAD_FOLDER + ' [yes/no]:', function(ok){

                    if(ok !== 'yes'){

                        process.exit();

                    } else {

                        return cb(null);

                    }

                });

            },

            function(cb){



            }

        ]

    );

};

/**
 * Init
 */

async.series(

    [

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

                    console.log(data)

                }

                return cb(err);

            });

        },

        function(cb){

            //Guardamos el valor de CURRENT_COMMAND

            askCommand(function(err){

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

            //Guardamos el valor de CURRENT_PASSWORD

            askPassword(function(err){

                return cb(err);

            });

        },

        function(cb){

            if(CURRENT_COMMAND === 'download'){

                askDownload(function(err){

                    return cb(err);

                });

            } else if(CURRENT_COMMAND === 'upload'){


            } else {

                console.error('Invalid command');

            }

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




