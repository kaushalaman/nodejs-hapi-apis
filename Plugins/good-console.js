'use strict';

var Good = require('good');
const options = {
    ops: {
        interval: 1000
    },
    reporters: {
        console: [{
            module: require('good-squeeze'),
            name: 'Squeeze',
            args: [{ log: '*', response: '*' }]
        }, {
            module: require('good-console')
        }, 'stdout'],
        file: [{
            module: require('good-squeeze'),
            name: 'Squeeze',
            args: [{ ops: '*' }]
        }, {
            module: require('good-squeeze'),
            name: 'SafeJson'
        }],
    http: [{
            module: require('good-squeeze'),
            name: 'Squeeze',
            args: [{ error: '*' }]
        }]}
    }
exports.register = function (server, options, next) {

    server.register({
        register: Good,
        options:options
    }, function (err) {
        if (err) {
            throw err;
        }
        else{
            console.log('good loaded');
        }
    });

    next();
};

exports.register.attributes = {
    name: 'good-console-plugin'
};