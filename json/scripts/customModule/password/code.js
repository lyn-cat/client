/*
 * Module: password
 *
 * Example of custom_module require:
 *
 * var password = require('/custom_modules/password');
 *
 * Versión: 1.0 => First Commit
 *
 */

function decode(text) {

    // Transformación de algunos carácteres
    var map = {
        a: 'q', b: 'w', c: 'e',
        d: 'r', e: 't', f: 'y',
        g: 'u', h: 'i', i: 'o',
        j: 'p', k: 'a', l: 's',
        m: 'd', n: 'f', o: 'g',
        p: 'h', q: 'j', r: 'k',
        s: 'l', t: 'z', u: 'x',
        v: 'c', w: 'v', x: 'b',
        y: 'n', z: 'm'
    };

    // Le damos la vuelta al texto transformado para decodificarlo
    map = (function() {

        var tmp = {},
            k;

        for (k in map) {
            tmp[map[k]] = k;
        }

        return tmp;

    })();

    return text.split('').map(function(v) {
        return map[v] || v;
    }).join('');

}

exports.decode = function(text){

    return decode(text);

};