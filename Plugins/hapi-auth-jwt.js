'use strict';
const Config = require('../Config');

const options = { algorithms: ['HS256'] };
exports.register = function(server, options,next){
	server.register(require('hapi-auth-jwt'), (err) => {

  // We're giving the strategy both a name
  // and scheme of 'jwt'
  server.auth.strategy('token', 'jwt', {
    key: Config.serverConfig.key,
    verifyOptions: options
  });
  console.log('JWT loaded');
});
next();	
};

exports.register.attributes = {
    name: 'hapi-auth-jwt-plugin'
};