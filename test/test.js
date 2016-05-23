/**
 * Requires
 */

var tap = require('tap');
var packageJson = require('../package.json');
var lyncat = require('../lib/index.js');

/**
 * Private
 */


/**
 * Constants
 */

var ADMIN_KEY = 'PASSWORD';

/**
 * Login
 */

tap.test('Download Current Config', function(test){


    var options = {

        key: ADMIN_KEY

    };

    lyncat.download(options, function(err){



    });

});