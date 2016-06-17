'use strict';
let Mongoose = require('mongoose');
let Schema = Mongoose.Schema;
let bcrypt = require('bcrypt');
let moment = require('moment-timezone');
let constants = require('../Config/constants');
let User = require('./userschema');
let AutoIncrement = require('mongoose-sequence');

const TweetSchema = new Schema(
{
	//weet_id : {type: String, unique:true},
	tweet_text : {type: String},
	//entities: {},
	location: {
        'type': {type: String, enum: constants.GEO_JSON_TYPES.Point, default: constants.GEO_JSON_TYPES.Point},
        coordinates: {type: [Number], default: [0, 0]}
    },
    username : {type: String},
    name: {type: String}    
},
{ timestamps: { createdAt: 'created_at' } }
);



TweetSchema.plugin(AutoIncrement, {inc_field: 'id'});

module.exports = Mongoose.model('Tweet', TweetSchema);