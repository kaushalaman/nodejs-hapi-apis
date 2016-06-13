'use strict';
const Inert = require('inert');
const Vision = require('vision');
const pack = require('../package');
var options = {
    info: {
            'title': 'Twitter API',
            'version': pack.version,
        }
    };

exports.register = function(server, options, next){

    server.register([Inert,
    	Vision,
    {
        register: require('hapi-swagger'),
        options: options
    }], function (err) {
        if (err) {
            throw err;
        }else{
            console.log('hapi-swagger interface loaded');
        }
    });
next();
};

exports.register.attributes = {
    name: 'swagger-plugin'
};