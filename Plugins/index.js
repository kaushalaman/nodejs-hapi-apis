const Inert = require('inert');
const Vision = require('vision');

module.exports = [
 Inert,
 Vision,
 {register : require('./swagger')},
 {register: require('./good-console')},
 {register: require('./hapi-auth-jwt')}
];