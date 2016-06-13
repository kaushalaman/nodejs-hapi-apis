"use strict";
const Hapi = require('hapi');
const Hapiswagger = require('hapi-swagger');
const Vision = require('vision');
const Inert = require('inert');
const Joi = require('joi');
const Good = require('good');
const mongoose = require('mongoose');
const config = require('./Config');
const Routes = require('./Routes');
const Path = require('path');
const server = new Hapi.Server();
const Plugins = require('./Plugins');
const Pack = require('./package');
const log4js = require('log4js');
var logger = log4js.getLogger('[SERVER]');
var connectionOptions = {
	port : config.serverConfig.PORT,
	host : config.serverConfig.HOST,
	routes : {
		cors: true
	}
};

const options = {
    info: {
            'title': 'Twitter API',
            'version': Pack.version,
        }
    };
server.connection(connectionOptions);

Routes.forEach(function (api) {
    server.route(api);
});

server.register(Plugins, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Plugins loaded");
    }


});

server.start( (err) => {
           if (err) {
                console.log(err);
            } else {
                console.log('Server running at:', server.info.uri);
            }
        });
