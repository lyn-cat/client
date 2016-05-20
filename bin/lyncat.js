#!/usr/bin/env node

/*
 * Requires
 */

var lyncat = require('../lib');
var async = require('async');
var program = require('commander-plus');
var figlet = require('figlet');

/**
 * Properties
 */

var STEP = 0;
var COMMANDS = ['download', 'update'];
var CURRENT_COMMAND = null;
var CURRENT_HOST = null;
var CURRENT_APP = null;

/**
 * Private Methods
 */

var ask

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

/**
 * Init
 */

async.series(

    [

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

        }

    ],

    function(err){


    }

);




