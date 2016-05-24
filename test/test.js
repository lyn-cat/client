/**
 * Requires
 */

var tap = require('tap');
var packageJson = require('../package.json');
var lyncat = require('../lib/index.js');
var path = require('path');

/**
 * Private
 */



/**
 * Constants
 */

var DOWNLOADS_FOLDER =  path.join(__dirname, '/../files');

/**
 * Get Update
 */

tap.test('Get Default Update', function(test){


    lyncat.getUpdateJSON(DOWNLOADS_FOLDER, function(err, json){

        test.end();

    });


});